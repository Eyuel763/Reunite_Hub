from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import timedelta

class CustomUserManager(BaseUserManager):
    def create_user(self, email, phone, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'Admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, phone, password, **extra_fields)
    
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('Regular', 'Regular User'),
        ('Volunteer', 'Volunteer'),
        ('Moderator', 'Moderator'),
        ('Admin', 'Admin'),
    )

    LANGUAGE_CHOICES = (
        ('en', 'English'),
        ('am', 'Amharic'),
        ('or', 'Oromo'),
    )

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    
    phone_regex = RegexValidator(
        regex=r'^\+251[79]\d{8}$', 
        message="Phone number must be entered in the format: '+251XXXXXXXXX' (e.g., +251911234567)."
    )
    phone = models.CharField(validators=[phone_regex], max_length=15, unique=True)
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Regular')
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='en')
    
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone']

    objects = CustomUserManager()

    def __str__(self):
        return self.email
    
class MFA(models.Model):
    MFA_METHOD_CHOICES = (
        ('email', 'Email Verification'),
        ('sms', 'SMS Verification'), 
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    mfa_enabled = models.BooleanField(default=False)
    mfa_method = models.CharField(max_length=10, choices=MFA_METHOD_CHOICES, default='email')
    
    # Verification Fields
    verification_code = models.CharField(max_length=6, blank=True, null=True)
    code_expiration = models.DateTimeField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_code_valid(self):
        if self.code_expiration and self.code_expiration > timezone.now():
            return True
        return False
        
    def __str__(self):
        return f"MFA for {self.user.email}"
    
class OAuth(models.Model):
    PROVIDER_CHOICES = (
        ('google', 'Google'),
        ('facebook', 'Facebook'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    oauth_id = models.CharField(max_length=255, unique=True)
    access_token = models.CharField(max_length=512, blank=True, null=True) # Token may be needed for external API calls

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'provider') 

    def __str__(self):
        return f"{self.user.email} via {self.provider}"
