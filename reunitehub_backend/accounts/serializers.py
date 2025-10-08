from rest_framework import serializers
from .models import User
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'phone', 'first_name', 'last_name', 'password', 'role', 'language')
        extra_kwargs = {
            'password': {'write_only': True},
            'phone': {'required': True}, 
            'first_name': {'required': False},
            'last_name': {'required': False},
            'role': {'required': False},
            'language': {'required': False},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        email = validated_data.pop('email')
        phone = validated_data.pop('phone')
        
        user = User.objects.create_user(
            email=email,
            phone=phone,
            password=password, 
            **validated_data
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)