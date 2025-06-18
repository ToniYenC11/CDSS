# forms/urls.py (create this file if it doesn't exist)
from django.urls import path
from . import views

urlpatterns = [
    # Annotation endpoints
    path('annotations/', views.save_annotations, name='save_annotations'),
    path('annotations/<str:case_id>/', views.get_annotations, name='get_annotations'),
    path('annotations/list/', views.list_annotations, name='list_annotations'),
    path('annotations/<str:case_id>/delete/', views.delete_annotations, name='delete_annotations'),
]