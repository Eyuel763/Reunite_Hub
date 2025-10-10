from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
import requests
from django.db import IntegrityError

from django.contrib.auth import authenticate, get_user_model

from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, UserLoginSerializer

import random
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import MFA, User, OAuth

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
        
def generate_mfa_code():
    return str(random.randint(100000, 999999))

def send_mfa_email(email, code):
    print(f"\n[MFA SIMULATION] Sending code {code} to {email}")
    # send_mail(
    #     'ReuniteHub MFA Code',
    #     f'Your verification code is: {code}',
    #     settings.DEFAULT_FROM_EMAIL,
    #     [email],
    #     fail_silently=False,
    # )
    return True

class MFAEnableView(APIView):
    """
    Endpoint: POST /api/auth/mfa/enable
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        code = generate_mfa_code()
        expiration = timezone.now() + timedelta(minutes=5)

        # Get or create the MFA object for the user
        mfa_instance, created = MFA.objects.get_or_create(user=user)
        
        # Update code and expiration
        mfa_instance.verification_code = code
        mfa_instance.code_expiration = expiration
        mfa_instance.is_verified = False
        mfa_instance.mfa_method = 'email' 
        mfa_instance.save()

        # Mock email sending
        send_mfa_email(user.email, code)

        return Response(
            {'detail': 'MFA code sent to your registered email. It expires in 5 minutes.'},
            status=status.HTTP_200_OK
        )
    
class MFAVerifyView(APIView):
    """
    Endpoint: POST /api/auth/mfa-verify
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get('code')

        if not code:
            return Response({'code': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            mfa_instance = MFA.objects.get(user=user)
        except MFA.DoesNotExist:
            return Response({'detail': 'MFA setup not initiated for this user.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Check code validity (not expired)
        if not mfa_instance.is_code_valid():
            return Response({'detail': 'Verification code is expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Check code match
        if mfa_instance.verification_code == code:
            # Code matched and is not expired
            mfa_instance.mfa_enabled = True # Enable MFA
            mfa_instance.is_verified = True
            mfa_instance.verification_code = None # Clear code after successful use
            mfa_instance.code_expiration = None
            mfa_instance.save()
            
            return Response(
                {'detail': 'Multi-Factor Authentication enabled successfully.'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'code': 'Invalid verification code.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
def validate_google_token(access_token):
    """
    Validates a Google access token and returns user info.
    """
    try:
        response = requests.get(
            f"https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token={access_token}"
        )
        response.raise_for_status() # Raises an HTTPError for bad responses
        return response.json()
    except requests.exceptions.RequestException:
        return None

def validate_facebook_token(access_token):
    """
    Validates a Facebook access token and returns user info.
    """
    try:
        # Endpoint to get user profile data
        response = requests.get(
            f"https://graph.facebook.com/v15.0/me?fields=id,email,first_name,last_name&access_token={access_token}"
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        return None



class OAuthLoginView(APIView):
    """
    Handles user login/registration via OAuth (Google or Facebook).
    Endpoint: POST /api/auth/oauth-login
    """
    permission_classes = [AllowAny]

    def post(self, request):
        provider = request.data.get('provider')
        access_token = request.data.get('access_token')

        if not provider or not access_token:
            return Response(
                {'detail': 'Provider and access_token are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if provider == 'google':
            user_info = validate_google_token(access_token)
            oauth_id_field = 'id'
        elif provider == 'facebook':
            user_info = validate_facebook_token(access_token)
            oauth_id_field = 'id'
        else:
            return Response(
                {'detail': 'Invalid OAuth provider.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user_info:
            return Response(
                {'detail': 'Invalid or expired external access token.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        # Get core user data from external source
        email = user_info.get('email')
        oauth_id = user_info.get(oauth_id_field)

        if not email:
            return Response(
                {'detail': f'Cannot log in. {provider} did not provide an email address.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if OAuth account exists (Login flow)
        try:
            oauth_instance = OAuth.objects.get(provider=provider, oauth_id=oauth_id)
            user = oauth_instance.user # User exists, proceed to login
        except OAuth.DoesNotExist:
            
            # Check if User exists locally by email (Link flow)
            try:
                user = User.objects.get(email=email)
                # If user exists, link the new OAuth profile to the existing user
                OAuth.objects.create(
                    user=user, 
                    provider=provider, 
                    oauth_id=oauth_id,
                    access_token=access_token # Store token for future external API calls
                )
                
            # User does not exist (Registration flow)
            except User.DoesNotExist:
                user = User.objects.create_user(
                    email=email,
                    # HACK: Use a placeholder phone number and force the user 
                    # to update it on first login via a frontend redirect.
                    # Because phone is a REQUIRED_FIELD.
                    phone=f'+25190000{random.randint(1000, 9999)}', 
                    password=None, 
                    first_name=user_info.get('first_name'),
                    last_name=user_info.get('last_name'),
                )
                OAuth.objects.create(
                    user=user, 
                    provider=provider, 
                    oauth_id=oauth_id,
                    access_token=access_token
                )
                # Since phone number is a requirement in Ethiopia, 
                # we flag the user for immediate profile completion.
                needs_profile_completion = True
            
        # Generate JWT Tokens for the logged-in/newly created user
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'message': f'Login via {provider} successful.',
            'user_id': user.id,
            'email': user.email,
            'role': user.role,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        
        if 'needs_profile_completion' in locals() and needs_profile_completion:
             response_data['needs_profile_completion'] = True
             response_data['detail'] = "Registration complete. Please update your phone number."

        return Response(response_data)

