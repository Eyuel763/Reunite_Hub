from rest_framework import serializers
from .models import FamilySupport, Resource

class FamilySupportSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = FamilySupport
        fields = [
            'id', 'user', 'user_email', 'report', 'subject', 
            'support_message', 'contacted_at', 'status'
        ]
        read_only_fields = ['id', 'user', 'contacted_at', 'status', 'user_email']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'category', 'content', 'link_url', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']