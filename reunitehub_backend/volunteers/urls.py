from django.urls import path
from .views import VolunteerApplyView, VolunteerDetailView, PartnerListView

urlpatterns = [
    path('apply/', VolunteerApplyView.as_view(), name='volunteer-apply'),
    path('status/', VolunteerDetailView.as_view(), name='volunteer-status'),
    path('partners/', PartnerListView.as_view(), name='partner-list'),
]