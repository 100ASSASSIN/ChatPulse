from rest_framework import serializers
from .models import ChatFile

class ChatFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatFile
        fields = '__all__'
