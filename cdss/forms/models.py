from django.db import models
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
