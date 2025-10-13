from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import VolunteerApplication, Partner
from .serializers import VolunteerApplicationSerializer, PartnerSerializer

# Custom permission to ensure user is submitting only for themselves
class IsSelfOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write access (PUT/PATCH/DELETE) is only allowed to the owner or an admin
        return obj.user == request.user or request.user.is_staff or request.user.is_superuser


class VolunteerApplyView(generics.CreateAPIView):
    """
    POST: Allows an authenticated user to submit a volunteer application.
    """
    serializer_class = VolunteerApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"detail": "Volunteer application submitted successfully and is pending review.", 
             "id": serializer.data['id']}, 
            status=status.HTTP_201_CREATED, headers=headers
        )

class VolunteerDetailView(generics.RetrieveAPIView):
    """
    GET: Retrieve the user's own volunteer application status.
    """
    queryset = VolunteerApplication.objects.all()
    serializer_class = VolunteerApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Restrict the queryset to only the application belonging to the logged-in user
        queryset = self.get_queryset()
        obj = generics.get_object_or_404(queryset, user=self.request.user)
        self.check_object_permissions(self.request, obj)
        return obj

class PartnerListView(generics.ListAPIView):
    """
    GET: List all verified partners for display on the front-end (public).
    """
    queryset = Partner.objects.filter(is_verified_partner=True).order_by('name')
    serializer_class = PartnerSerializer
    permission_classes = [permissions.AllowAny]
