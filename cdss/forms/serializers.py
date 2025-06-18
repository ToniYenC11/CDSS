from rest_framework import serializers
from forms.models import Forms, CaseImage, Annotation, BoundingBox

class FormsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forms
        fields = '__all__'
class BoundingBoxSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoundingBox
        fields = ['box_id', 'x', 'y', 'width', 'height', 
                 'relative_x', 'relative_y', 'relative_width', 'relative_height',
                 'label', 'confidence']

class AnnotationSerializer(serializers.ModelSerializer):
    bounding_boxes = BoundingBoxSerializer(many=True, read_only=True)
    
    class Meta:
        model = Annotation
        fields = ['annotation_id', 'annotations_data', 'total_annotations',
                 'positive_count', 'negative_count', 'created_at', 'updated_at',
                 'bounding_boxes']

class CaseImageSerializer(serializers.ModelSerializer):
    annotations = AnnotationSerializer(many=True, read_only=True)
    
    class Meta:
        model = CaseImage
        fields = ['case_id', 'patient_id', 'image_name', 'image_path',
                 'uploaded_at', 'status', 'annotations']

# Request serializers for API endpoints
class AnnotationRequestSerializer(serializers.Serializer):
    caseId = serializers.CharField(max_length=50)
    patientId = serializers.CharField(max_length=50)
    imageName = serializers.CharField(max_length=255)
    annotations = serializers.ListField(
        child=serializers.DictField(), 
        allow_empty=False
    )
    
    def validate_annotations(self, value):
        """Validate each annotation in the list"""
        required_fields = ['id', 'x', 'y', 'width', 'height', 'label', 
                          'relativeX', 'relativeY', 'relativeWidth', 'relativeHeight']
        
        for annotation in value:
            for field in required_fields:
                if field not in annotation:
                    raise serializers.ValidationError(f"Missing required field: {field}")
                    
            # Validate label
            if annotation['label'] not in ['positive', 'negative']:
                raise serializers.ValidationError("Label must be 'positive' or 'negative'")
                
        return value

class AnnotationResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    annotation_id = serializers.CharField(required=False)
    case_id = serializers.CharField(required=False)
    total_annotations = serializers.IntegerField(required=False)
    positive_count = serializers.IntegerField(required=False)
    negative_count = serializers.IntegerField(required=False)