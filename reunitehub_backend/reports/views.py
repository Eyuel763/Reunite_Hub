from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Report, Sighting, Tip
from .serializers import ReportSerializer, SightingSerializer, TipSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework.exceptions import NotFound
from .permissions import IsOwnerOrReadOnly
from .filters import ReportFilter
from .tasks import send_critical_alert
from .utils import broadcast_new_sighting

class ReportListCreateView(generics.ListCreateAPIView):
    """
    GET: Lists all verified (or pending) reports for public search and filtering.
    POST: Creates a new report. Requires authentication.
    """
    queryset = Report.objects.filter(status__in=['pending', 'verified']).order_by('-created_at')
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticatedOrReadOnly] 
    filterset_class = ReportFilter

    def perform_create(self, serializer):
        serializer.save(reported_by=self.requested.user)

class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a single report.
    PUT/PATCH/DELETE: Update or delete a report. Only accessible to the report owner.
    """
    queryset = Report.objects.filter(status__in=['pending', 'verified'])
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly ]

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        
        instance = serializer.save()
        
        if old_status != 'verified' and instance.status == 'verified':
            # Trigger the asynchronous task to send alerts
            send_critical_alert.delay(
                report_id=instance.id, 
                full_name=instance.full_name, 
                location=instance.last_seen_location
            )

class SightingListCreateView(generics.ListCreateAPIView):
    """
    GET: List all sightings for a specific Report ID.
    POST: Submit a new sighting for a specific Report ID.
    """
    serializer_class = SightingSerializer
    permission_classes = [AllowAny] # Allow anonymous submissions

    def get_queryset(self):
        report_id = self.kwargs['report_pk']
        return Sighting.objects.filter(report_id=report_id).order_by('-sighting_date')

    def perform_create(self, serializer):
        try:
            report = Report.objects.get(pk=self.kwargs['report_pk'])
            sighting_instance = serializer.save(report=report)
            broadcast_new_sighting(sighting_instance)
        except Report.DoesNotExist:
            raise NotFound("Missing Person Report not found.")
            
        serializer.save(report=report)


class TipListCreateView(generics.ListCreateAPIView):
    """
    GET: List all tips for a specific Report ID (Admin/Moderator view).
    POST: Submit a new tip for a specific Report ID (Supports anonymous).
    """
    serializer_class = TipSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        report_id = self.kwargs['report_pk']
        return Tip.objects.filter(report_id=report_id).order_by('-created_at')

    def perform_create(self, serializer):
        try:
            report = Report.objects.get(pk=self.kwargs['report_pk'])
        except Report.DoesNotExist:
            raise NotFound("Missing Person Report not found.")

        serializer.save(report=report)

class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    # ... (Keep existing queryset, serializer_class, and permission_classes)
    
    # Override perform_update to trigger the Celery task
    def perform_update(self, serializer):
        # Retrieve the old status before saving changes
        old_status = serializer.instance.status
        
        # Save the updated object
        instance = serializer.save()
        
        # Check if the status changed to 'verified' (e.g., by a moderator/admin)
        if old_status != 'verified' and instance.status == 'verified':
            # Trigger the asynchronous task to send alerts
            # .delay() is a Celery shortcut for .apply_async()
            send_critical_alert.delay(
                report_id=instance.id, 
                full_name=instance.full_name, 
                location=instance.last_seen_location
            )
            
            # NOTE: We would also trigger a WebSocket broadcast here (next step).

