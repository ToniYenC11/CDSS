"""
URL configuration for cdss project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django_nextjs.views import nextjs_page
from rest_framework import routers  # Import routers here
from forms.viewsets import FormViewSet # Import FormViewSet here
from forms.views import upload_image, list_forms
from django.conf import settings
from django.conf.urls.static import static
from forms.views import upload_image, list_forms,case_detail
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


# Define the router directly in urls.py
router = routers.SimpleRouter()
router.register(r'forms', FormViewSet, basename='forms')
# urlpatterns from router are not needed here if you include them directly below

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", nextjs_page(stream=True), name="main"),
    path("receipt/<id>/", nextjs_page(stream=True), name="receipt"),
    path("database/", nextjs_page(stream=True), name="database"),
    path("about/", nextjs_page(stream=True), name="about"),
    path('api/', include((router.urls, 'core_api'), namespace='core_api')), # Use router.urls directly
    path("upload/", upload_image, name="upload_image"),
    path("list/", list_forms, name="list_forms"),
    path("case/<int:case_id>/", case_detail, name="case_detail"),  # This handles both GET and DELETE
    path('admin/', admin.site.urls),
    path('api/', include('forms.urls')),  # This includes your annotation endpoints
    
    # Schema generation endpoint
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    # Optional: Swagger UI
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    # Optional: ReDoc UI
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)