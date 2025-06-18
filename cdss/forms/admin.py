# forms/admin.py
from django.contrib import admin
from .models import Forms, CaseImage, Annotation, BoundingBox

@admin.register(Forms)
class FormsAdmin(admin.ModelAdmin):
    list_display = ['CaseID', 'PatientID', 'Date', 'Diagnosis', 'Confidence']
    list_filter = ['Date', 'Diagnosis']
    search_fields = ['PatientID', 'Diagnosis']
    readonly_fields = ['CaseID', 'PatientID', 'Date']
@admin.register(CaseImage)
class CaseImageAdmin(admin.ModelAdmin):
    list_display = ['case_id', 'patient_id', 'image_name', 'status', 'uploaded_at']
    list_filter = ['status', 'uploaded_at']
    search_fields = ['case_id', 'patient_id', 'image_name']
    readonly_fields = ['uploaded_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('annotations')

class BoundingBoxInline(admin.TabularInline):
    model = BoundingBox
    extra = 0
    readonly_fields = ['box_id']

@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    list_display = ['annotation_id', 'case_image', 'total_annotations', 
                   'positive_count', 'negative_count', 'created_at']
    list_filter = ['created_at', 'total_annotations']
    search_fields = ['annotation_id', 'case_image__case_id', 'case_image__patient_id']
    readonly_fields = ['annotation_id', 'total_annotations', 'positive_count', 
                      'negative_count', 'created_at', 'updated_at']
    inlines = [BoundingBoxInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('case_image')

@admin.register(BoundingBox)
class BoundingBoxAdmin(admin.ModelAdmin):
    list_display = ['annotation', 'box_id', 'label', 'x', 'y', 'width', 'height']
    list_filter = ['label']
    search_fields = ['annotation__annotation_id', 'annotation__case_image__case_id']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('annotation__case_image')