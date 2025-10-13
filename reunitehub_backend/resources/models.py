from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL 

class FamilySupport(models.Model):
    """
    Model for family support requests (private moderated messages).
    """
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='support_requests')
    report = models.ForeignKey('reports.Report', on_delete=models.SET_NULL, null=True, blank=True, related_name='support_tickets', help_text="Optional: Link to a specific missing person report.")
    
    subject = models.CharField(max_length=255, help_text="Brief subject of the support request.")
    support_message = models.TextField(help_text="Detailed message requesting support.")
    
    contacted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Optional field for internal use by moderator/counselor
    moderator_notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Support Request {self.id} ({self.get_status_display()})"

    class Meta:
        verbose_name_plural = "Family Support Requests"
        ordering = ['-contacted_at']


class Resource(models.Model):
    """
    Model for general resources (e.g., checklists, aid directories).
    """
    CATEGORY_CHOICES = (
        ('checklist', 'First 48 Hours Checklist'),
        ('legal', 'Legal Aid Directory'),
        ('health', 'Mental Health Support'),
        ('other', 'Other Useful Guide'),
    )

    title = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    
    # Content can be text or a direct link/file upload
    content = models.TextField(blank=True, null=True, help_text="Full text content of the resource (e.g., checklist steps).")
    link_url = models.URLField(blank=True, null=True, help_text="URL to an external resource or downloadable file.")
    
    is_public = models.BooleanField(default=True, help_text="If false, only visible to authenticated users/admins.")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Resources"
        ordering = ['category', 'title']
