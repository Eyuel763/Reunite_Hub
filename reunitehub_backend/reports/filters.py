import django_filters
from .models import Report

class ReportFilter(django_filters.FilterSet):
    """
    Defines filters for the Report model.
    """
    
    # 1. Date Range Filter (e.g., last_seen_date__gte=2024-01-01)
    # Allows filtering reports where the last seen date is greater than or equal to (gte) 
    # the provided value, enabling a search window.
    last_seen_after = django_filters.DateTimeFilter(
        field_name='last_seen_date', 
        lookup_expr='gte',
        label='Last Seen Date (After)',
    )
    
    # 2. Location Search (Case-insensitive partial match on the description field)
    location_search = django_filters.CharFilter(
        field_name='last_seen_location', 
        lookup_expr='icontains',
        label='Location (Contains)',
    )
    
    # 3. Age Range Filter
    # Allows for minimum age (e.g., age__gte=10)
    min_age = django_filters.NumberFilter(
        field_name='age', 
        lookup_expr='gte',
        label='Minimum Age',
    )
    # Allows for maximum age (e.g., age__lte=20)
    max_age = django_filters.NumberFilter(
        field_name='age', 
        lookup_expr='lte',
        label='Maximum Age',
    )
    
    # 4. Gender Filter (Exact match)
    gender = django_filters.CharFilter(
        field_name='gender', 
        lookup_expr='exact',
        label='Gender (Exact)',
    )

    class Meta:
        model = Report
        fields = [
            'gender', 'age_range', 'status',
            'last_seen_after', 'location_search', 'min_age', 'max_age', 
        ]