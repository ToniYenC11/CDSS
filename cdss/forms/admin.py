# forms/admin.py
from django.contrib import admin
from .models import Forms

@admin.register(Forms)
class FormsAdmin(admin.ModelAdmin):
    list_display = ['CaseID', 'PatientID', 'Date', 'Diagnosis', 'Confidence']
    list_filter = ['Date', 'Diagnosis']
    search_fields = ['PatientID', 'Diagnosis']
    readonly_fields = ['CaseID', 'PatientID', 'Date']