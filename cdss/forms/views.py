from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, Http404
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from forms.models import Forms, CaseImage, Annotation, BoundingBox
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    AnnotationRequestSerializer, 
    AnnotationResponseSerializer,
    CaseImageSerializer,
    AnnotationSerializer
)
import uuid
from datetime import datetime
from django.utils import timezone
from rest_framework.decorators import api_view

def get_diagnosis_from_annotations(case_id_str):
    """Determines diagnosis based on the latest annotations for a case."""
    try:
        case_image = CaseImage.objects.get(case_id=case_id_str)
        # Get the latest annotation session for this image
        latest_annotation = case_image.annotations.order_by('-created_at').first()
        if not latest_annotation:
            return "Not Annotated"

        # Check for any positive bounding boxes
        if latest_annotation.bounding_boxes.filter(label='positive').exists():
            return "Positive"
        # If there are boxes, but none are positive, they must all be negative
        elif latest_annotation.bounding_boxes.exists():
            return "Negative"
        else:
            # This case means an Annotation object exists but has no BoundingBox objects
            return "Not Annotated"
    except CaseImage.DoesNotExist:
        return "Not Annotated"

@csrf_exempt
def upload_image(request):
    if request.method == 'POST':
        image = request.FILES.get('image')
        if not image:
            return JsonResponse({'error': 'No image provided'}, status=400)

        form = Forms(Image=image)
        form.save()

        return JsonResponse({
            'message': 'Upload successful',
            'CaseID': form.CaseID,
            'PatientID': form.PatientID,
            'Diagnosis': form.Diagnosis,
            'Confidence': form.Confidence,
            'Date': form.Date
        })

    return JsonResponse({'error': 'Invalid method'}, status=405)

def list_forms(request):
    forms = Forms.objects.all().order_by('-Date')
    
    response_data = []
    for form in forms:
        # Calculate diagnosis based on annotations
        diagnosis = get_diagnosis_from_annotations(str(form.CaseID))
        
        response_data.append({
            'CaseID': form.CaseID,
            'PatientID': form.PatientID,
            'Date': str(form.Date),
            'Diagnosis': diagnosis,
            'Confidence': form.Confidence,
        })

    return JsonResponse({'forms': response_data})

@csrf_exempt
def case_detail(request, case_id):
    """Get or delete a specific case by ID"""
    if request.method == 'GET':
        try:
            form = get_object_or_404(Forms, CaseID=case_id)
            
            # Calculate diagnosis based on annotations
            diagnosis = get_diagnosis_from_annotations(str(form.CaseID))

            annotations_data = []
            try:
                # The case_id in CaseImage is a string representation of Forms.CaseID
                case_image = CaseImage.objects.get(case_id=str(form.CaseID))
                # Get the latest annotation session for this image
                latest_annotation = case_image.annotations.order_by('-created_at').first()

                if latest_annotation:
                    # Get all bounding boxes for this annotation
                    for box in latest_annotation.bounding_boxes.all():
                        annotations_data.append({
                            'id': box.box_id,
                            'x': box.x,
                            'y': box.y,
                            'width': box.width,
                            'height': box.height,
                            'label': box.label,
                            'relativeX': box.relative_x,
                            'relativeY': box.relative_y,
                            'relativeWidth': box.relative_width,
                            'relativeHeight': box.relative_height,
                        })
            except CaseImage.DoesNotExist:
                # No annotations exist for this case, which is a valid state.
                pass

            return JsonResponse({
                'CaseID': form.CaseID,
                'PatientID': form.PatientID,
                'Date': str(form.Date),
                'Diagnosis': diagnosis, # Use calculated diagnosis
                'Confidence': form.Confidence,
                'Image': form.Image.url if form.Image else None,
                'imageName': form.Image.name.split('/')[-1] if form.Image else None,
                'annotations': annotations_data,
            })
        except Forms.DoesNotExist:
            return JsonResponse({'error': 'Case not found'}, status=404)
    
    elif request.method == 'DELETE':
        try:
            form = get_object_or_404(Forms, CaseID=case_id)
            
            # Find and delete related CaseImage, which will cascade to Annotations and BoundingBoxes
            try:
                # The case_id in CaseImage is a string representation of Forms.CaseID
                case_image = CaseImage.objects.get(case_id=str(form.CaseID))
                case_image.delete() # This will cascade delete Annotations and BoundingBoxes
            except CaseImage.DoesNotExist:
                # If no CaseImage, there are no annotations to delete.
                pass
            
            # Delete the image file from storage if it exists
            if form.Image:
                try:
                    default_storage.delete(form.Image.name)
                except Exception as e:
                    print(f"Warning: Could not delete image file: {e}")
            
            # Delete the database record
            form.delete()
            
            return JsonResponse({'message': 'Case deleted successfully'})
        except Forms.DoesNotExist:
            return JsonResponse({'error': 'Case not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@api_view(['POST'])
def save_annotations(request):
    """
    Save annotations for a case image
    """
    try:
        # Validate request data
        serializer = AnnotationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Invalid data provided',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        
        # Get or create case image
        case_image, created = CaseImage.objects.get_or_create(
            case_id=validated_data['caseId'],
            defaults={
                'patient_id': validated_data['patientId'],
                'image_name': validated_data['imageName'],
                'status': 'uploaded'
            }
        )
        
        # Generate unique annotation ID
        annotation_id = f"ann_{validated_data['caseId']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        
        # Create annotation record
        annotation = Annotation.objects.create(
            case_image=case_image,
            annotation_id=annotation_id,
            annotations_data={
                'caseId': validated_data['caseId'],
                'patientId': validated_data['patientId'],
                'imageName': validated_data['imageName'],
                'annotations': validated_data['annotations'],
                'annotated_at': timezone.now().isoformat()
            }
        )
        
        # Create individual bounding box records
        for box_data in validated_data['annotations']:
            BoundingBox.objects.create(
                annotation=annotation,
                box_id=box_data['id'],
                x=box_data['x'],
                y=box_data['y'],
                width=box_data['width'],
                height=box_data['height'],
                relative_x=box_data['relativeX'],
                relative_y=box_data['relativeY'],
                relative_width=box_data['relativeWidth'],
                relative_height=box_data['relativeHeight'],
                label=box_data['label']
            )
        
        # Update case image status
        case_image.status = 'annotated'
        case_image.save()
        
        # Prepare response
        response_data = {
            'success': True,
            'message': f'Successfully saved {annotation.total_annotations} annotations',
            'annotation_id': annotation_id,
            'case_id': validated_data['caseId'],
            'total_annotations': annotation.total_annotations,
            'positive_count': annotation.positive_count,
            'negative_count': annotation.negative_count
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to save annotations: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_annotations(request, case_id):
    """
    Get annotations for a specific case
    """
    try:
        case_image = get_object_or_404(CaseImage, case_id=case_id)
        serializer = CaseImageSerializer(case_image)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to retrieve annotations: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def list_annotations(request):
    """
    List all annotated cases
    """
    try:
        case_images = CaseImage.objects.filter(status='annotated').order_by('-uploaded_at')
        serializer = CaseImageSerializer(case_images, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': len(case_images)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to list annotations: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_annotations(request, case_id):
    """
    Delete annotations for a specific case
    """
    try:
        case_image = get_object_or_404(CaseImage, case_id=case_id)
        
        # Delete all annotations for this case
        deleted_count = 0
        for annotation in case_image.annotations.all():
            deleted_count += annotation.bounding_boxes.count()
            annotation.delete()
        
        # Update case status
        case_image.status = 'uploaded'
        case_image.save()
        
        return Response({
            'success': True,
            'message': f'Successfully deleted {deleted_count} annotations for case {case_id}'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to delete annotations: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)