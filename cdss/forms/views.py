from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, Http404
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from forms.models import Forms

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
    return JsonResponse({
        'forms': [
            {
                'CaseID': form.CaseID,
                'PatientID': form.PatientID,
                'Date': str(form.Date),
                'Diagnosis': form.Diagnosis,
                'Confidence': form.Confidence,
            }
            for form in forms
        ]
    })

@csrf_exempt
def case_detail(request, case_id):
    """Get or delete a specific case by ID"""
    if request.method == 'GET':
        try:
            form = get_object_or_404(Forms, CaseID=case_id)
            return JsonResponse({
                'CaseID': form.CaseID,
                'PatientID': form.PatientID,
                'Date': str(form.Date),
                'Diagnosis': form.Diagnosis,
                'Confidence': form.Confidence,
                'Image': form.Image.url if form.Image else None,
            })
        except Forms.DoesNotExist:
            return JsonResponse({'error': 'Case not found'}, status=404)
    
    elif request.method == 'DELETE':
        try:
            form = get_object_or_404(Forms, CaseID=case_id)
            
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