from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from forms.models import Forms
from forms.serializers import FormsSerializer

class FormViewSet(viewsets.ModelViewSet):
    queryset = Forms.objects.all()
    serializer_class = FormsSerializer
    permission_classes = [AllowAny]
