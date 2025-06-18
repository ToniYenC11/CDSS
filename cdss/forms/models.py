from django.db import models
from django.contrib.auth.models import User
import json
from datetime import datetime

def get_upload_path(instance, filename):
    return f'uploads/{instance.PatientID}/{filename}'

class Forms(models.Model):
    CaseID = models.AutoField(primary_key=True)
    PatientID = models.CharField(max_length=20, unique=True, editable=False)
    Date = models.DateField(auto_now_add=True)
    Diagnosis = models.CharField(max_length=255, blank=True)
    Confidence = models.CharField(max_length=10, blank=True)
    Image = models.ImageField(upload_to=get_upload_path)

    def save(self, *args, **kwargs):
        if not self.PatientID:
            now = datetime.now()
            count = Forms.objects.filter(
                PatientID__startswith=f"{now.year}-{now.month:02}"
            ).count() + 1
            self.PatientID = f"{now.year}-{now.month:02}-{count:06d}"
        if not self.Diagnosis:
            self.Diagnosis = "Cancer"  # simulate script.py
        if not self.Confidence:
            self.Confidence = "90%"  # simulate script.py
        super().save(*args, **kwargs)
class CaseImage(models.Model):
    case_id = models.CharField(max_length=50, unique=True)
    patient_id = models.CharField(max_length=50)
    image_name = models.CharField(max_length=255)
    image_path = models.CharField(max_length=500, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='uploaded')
    
    class Meta:
        db_table = 'case_images'
        
    def __str__(self):
        return f"Case {self.case_id} - {self.image_name}"

class Annotation(models.Model):
    case_image = models.ForeignKey(CaseImage, on_delete=models.CASCADE, related_name='annotations')
    annotation_id = models.CharField(max_length=100, unique=True)
    annotations_data = models.JSONField()  # Store all bounding boxes as JSON
    total_annotations = models.IntegerField(default=0)
    positive_count = models.IntegerField(default=0)
    negative_count = models.IntegerField(default=0)
    annotated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'annotations'
        
    def __str__(self):
        return f"Annotation for Case {self.case_image.case_id}"
        
    def save(self, *args, **kwargs):
        # Auto-calculate counts when saving
        if self.annotations_data:
            annotations = self.annotations_data.get('annotations', [])
            self.total_annotations = len(annotations)
            self.positive_count = len([a for a in annotations if a.get('label') == 'positive'])
            self.negative_count = len([a for a in annotations if a.get('label') == 'negative'])
        super().save(*args, **kwargs)

class BoundingBox(models.Model):
    """Individual bounding box model (alternative to JSON storage)"""
    annotation = models.ForeignKey(Annotation, on_delete=models.CASCADE, related_name='bounding_boxes')
    box_id = models.IntegerField()  # ID within the annotation
    x = models.FloatField()
    y = models.FloatField()
    width = models.FloatField()
    height = models.FloatField()
    relative_x = models.FloatField()
    relative_y = models.FloatField()
    relative_width = models.FloatField()
    relative_height = models.FloatField()
    label = models.CharField(max_length=20, choices=[('positive', 'Positive'), ('negative', 'Negative')])
    confidence = models.FloatField(null=True, blank=True)  # For future AI predictions
    
    class Meta:
        db_table = 'bounding_boxes'
        unique_together = ['annotation', 'box_id']
        
    def __str__(self):
        return f"Box {self.box_id} - {self.label}"