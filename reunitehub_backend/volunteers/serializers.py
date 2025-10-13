from rest_framework import serializers
from .models import VolunteerApplication, Partner
from django.conf import settings

User = settings.AUTH_USER_MODEL

class VolunteerApplicationSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = VolunteerApplication
        fields = [
            'id', 'user', 'user_email', 'skill_set', 'availability', 
            'application_status', 'applied_at'
        ]
        read_only_fields = ['id', 'user', 'application_status', 'applied_at', 'user_email']

    def validate(self, data):
        user = self.context['request'].user
        if VolunteerApplication.objects.filter(user=user).exists():
            raise serializers.ValidationError("You have already submitted a volunteer application.")
        return data
        
    def create(self, validated_data):
        user = self.context['request'].user
        return VolunteerApplication.objects.create(user=user, **validated_data)

class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = [
            'id', 'name', 'partner_type', 'website', 
            'is_verified_partner', 'joined_at'
        ]
        read_only_fields = '__all__'