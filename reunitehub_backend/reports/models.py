from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator

User = settings.AUTH_USER_MODEL 

class Report(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Verification'),
        ('verified', 'Verified - Active'),
        ('resolved', 'Resolved - Found'),
        ('unfounded', 'Unfounded/False Report'),
    )
    
    # Blur faces of minors for privacy
    AGE_RANGE_CHOICES = (
        ('minor', 'Minor (Under 18)'), 
        ('adult', 'Adult (18+)'),
        ('unknown', 'Unknown Age'),
    )

    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='submitted_reports')
    full_name = models.CharField(max_length=255)
    age = models.IntegerField(validators=[MinValueValidator(0)], help_text="Age in years.")
    age_range = models.CharField(max_length=10, choices=AGE_RANGE_CHOICES, default='unknown')
    gender = models.CharField(max_length=10)
    
    last_seen_date = models.DateTimeField()
    last_seen_location = models.CharField(max_length=255, help_text="Specific place, e.g., 'Meskel Square, Addis Ababa'")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    description = models.TextField(help_text="Detailed physical description, clothing, and circumstances.")
    photo = models.ImageField(upload_to='reports/photos/%Y/%m/%d/', blank=True, null=True)
    
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Case {self.id}: {self.full_name} ({self.status})"
    
    # FUTURE: A property can be added here to trigger the face-blurring task 
    # based on self.age_range == 'minor'

class Sighting(models.Model):
    """
    Model for a user-reported sighting of a missing person.
    """
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='sightings')
    
    sighted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_sightings')
    sighting_date = models.DateTimeField(help_text="When the person was last sighted.")
    
    location_description = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    clothing_description = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='reports/sightings/%Y/%m/%d/', blank=True, null=True)
    
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sighting for {self.report.full_name} at {self.location_description}"

    class Meta:
        ordering = ['-sighting_date']


class Tip(models.Model):
    """
    Model for general information or leads related to a missing person report.
    Tips are often more textual and less location-specific than sightings.
    """
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='tips')
    
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_tips', help_text="Null if submitted anonymously.")
    
    content = models.TextField(help_text="Detailed information or lead.")
    
    # Optional contact info, if not anonymous
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tip for {self.report.full_name} (ID: {self.id})"

    class Meta:
        ordering = ['-created_at']
