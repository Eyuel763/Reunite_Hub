from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL 

class VolunteerApplication(models.Model):
    """
    Records applications from users wanting to be official volunteers.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved - Active'),
        ('rejected', 'Rejected'),
    )
    SKILL_CHOICES = (
        ('search', 'Search Party'),
        ('tech', 'Tech/Coding'),
        ('design', 'Graphic Design/Posters'),
        ('admin', 'Administrative Support'),
        ('other', 'Other'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='volunteer_profile')
    skill_set = models.CharField(max_length=50, choices=SKILL_CHOICES, default='other')
    availability = models.TextField(help_text="Details on when they can help.", blank=True)
    application_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Volunteer App: {self.user.email} ({self.get_application_status_display()})"

    class Meta:
        verbose_name_plural = "Volunteer Applications"


class Partner(models.Model):
    """
    Model for storing information about official partner organizations (NGOs, police, etc.)
    """
    TYPE_CHOICES = (
        ('ngo', 'Non-Governmental Organization'),
        ('gov', 'Government/Police'),
        ('corp', 'Corporate Sponsor'),
    )
    
    # We will need a way to link Partner staff accounts to the User model, 
    # but for simplicity now, we store the organization details.
    name = models.CharField(max_length=255, unique=True)
    partner_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    contact_email = models.EmailField(unique=True)
    website = models.URLField(blank=True, null=True)
    is_verified_partner = models.BooleanField(default=False, help_text="Checked by site admin for full access.")
    
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_partner_type_display()})"
    
    class Meta:
        verbose_name_plural = "Partners"
