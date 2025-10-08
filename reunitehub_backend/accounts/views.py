from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.contrib.auth import authenticate, get_user_model

from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, UserLoginSerializer

User = get_user_model()

class RegisterView(APIView):
    """
    Endpoint: POST /api/auth/register
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    Endpoint: POST /api/auth/login
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=email, password=password)

        if user is not None:
            # Successfully authenticated
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'user_id': user.id,
                'email': user.email,
                'role': user.role,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        else:
            # Authentication failed
            return Response(
                {'detail': 'Invalid credentials. Please check your email and password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
