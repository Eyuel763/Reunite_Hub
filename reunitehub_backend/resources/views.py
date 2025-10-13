from django.shortcuts import render
from rest_framework import generics, permissions
from .models import FamilySupport, Resource
from .serializers import FamilySupportSerializer, ResourceSerializer

class FamilySupportListCreateView(generics.ListCreateAPIView):
    """
    POST: Submit a new family support request.
    GET: List the user's own submitted support requests.
    """
    serializer_class = FamilySupportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own support requests
        return FamilySupport.objects.filter(user=self.request.user).order_by('-contacted_at')

class ResourceListView(generics.ListAPIView):
    """
    GET: List all public resources for the frontend (e.g., 'First 48 Hours').
    """
    serializer_class = ResourceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Only display resources flagged as public
        return Resource.objects.filter(is_public=True).order_by('category', 'title')
