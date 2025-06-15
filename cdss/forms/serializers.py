from rest_framework import serializers
from forms.models import Forms

class FormsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forms
        fields = '__all__'