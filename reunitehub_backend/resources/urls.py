from django.urls import path
from .views import FamilySupportListCreateView, ResourceListView

urlpatterns = [
    path('support/', FamilySupportListCreateView.as_view(), name='family-support-list-create'),
    path('list/', ResourceListView.as_view(), name='resource-list'),
]