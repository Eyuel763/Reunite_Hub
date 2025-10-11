from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Report, Sighting, Tip
from .serializers import ReportSerializer, SightingSerializer, TipSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework.exceptions import NotFound
from .permissions import IsOwnerOrReadOnly

class ReportListCreateView(generics.ListCreateAPIView):
    """
    GET: Lists all verified (or pending) reports for public search.
    POST: Creates a new report. Requires authentication.
    """
    queryset = Report.objects.filter(status__in=['pending', 'verified']).order_by('-created_at')
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticatedOrReadOnly] 

    def perform_create(self, serializer):
        serializer.save()

class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a single report.
    PUT/PATCH/DELETE: Update or delete a report. Only accessible to the report owner.
    """
    queryset = Report.objects.filter(status__in=['pending', 'verified'])
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly ]

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