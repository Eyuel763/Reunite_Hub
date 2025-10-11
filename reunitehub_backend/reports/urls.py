from django.urls import path
from .views import ReportListCreateView, ReportDetailView, SightingListCreateView, TipListCreateView

urlpatterns = [
    path('', ReportListCreateView.as_view(), name='report-list-create'),
    path('<int:pk>', ReportDetailView.as_view(), name='report-detail'),
    path('<int:report_pk>/sightings', SightingListCreateView.as_view(), name='sighting-list-create'),
    path('<int:report_pk>/tips', TipListCreateView.as_view(), name='tip-list-create'),
]