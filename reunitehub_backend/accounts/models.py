from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator

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
