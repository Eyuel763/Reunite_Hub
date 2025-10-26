from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/reports/live-feed/$', consumers.ReportLiveFeedConsumer.as_asgi()),
    re_path(r'ws/reports/(?P<report_id>\w+)/updates/$', consumers.ReportUpdateConsumer.as_asgi()),
]