from rest_framework import serializers
from .models import Report, Sighting, Tip 

class ReportSerializer(serializers.ModelSerializer):
    reported_by_email = serializers.ReadOnlyField(source='reported_by.email')

    class Meta:
        model = Report
        fields = [
            'id', 'reported_by', 'reported_by_email', 'full_name', 'age', 'age_range',
            'gender', 'last_seen_date', 'last_seen_location', 'description', 
            'photo', 'status', 'latitude', 'longitude', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'reported_by', 'reported_by_email', 'created_at']

    def create(self, validated_data):
        validated_data['reported_by'] = self.context['request'].user
        return super().create(validated_data)
    
class SightingSerializer(serializers.ModelSerializer):
    missing_person_name = serializers.ReadOnlyField(source='report.full_name')

    class Meta:
        model = Sighting
        fields = [
            'id', 'missing_person_name', 'sighting_date', 
            'location_description', 'latitude', 'longitude', 
            'clothing_description', 'photo', 'is_verified', 'created_at'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at']

    def create(self, validated_data):
        # Automatically set the user submitting the sighting if authenticated (optional, supports anonymity)
        user = self.context['request'].user
        if user.is_authenticated:
            validated_data['sighted_by'] = user
        # If user is anonymous, 'sighted_by' remains None (handled by model default)
        return super().create(validated_data)


class TipSerializer(serializers.ModelSerializer):
    missing_person_name = serializers.ReadOnlyField(source='report.full_name')

    class Meta:
        model = Tip
        fields = [
            'id', 'missing_person_name', 'content', 
            'contact_phone', 'is_verified', 'created_at'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at']

    def create(self, validated_data):
        # Automatically set the user submitting the tip if authenticated (optional, supports anonymity)
        user = self.context['request'].user
        if user.is_authenticated:
            validated_data['reported_by'] = user
        # If user is anonymous, 'reported_by' remains None
        return super().create(validated_data)