from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import SightingSerializer

# Utility function to push data to the Channels layer
def broadcast_new_sighting(sighting_instance):
    """Broadcasts a new sighting via WebSocket to all listening consumers."""
    channel_layer = get_channel_layer()
    
    # Serialize the new sighting data
    # Note: Use context=None here as request context is not available/needed
    data = SightingSerializer(sighting_instance).data

    # Group name for the overall Live Feed and the specific Report's page
    live_feed_group_name = 'report_live_feed'
    report_group_name = f'report_{sighting_instance.report.id}'

    # Create the event structure
    event = {
        'type': 'sighting_added', # Corresponds to the method name in consumers.py
        'data': data
    }

    # 1. Broadcast to the general Live Map feed
    async_to_sync(channel_layer.group_send)(
        live_feed_group_name,
        event
    )

    # 2. Broadcast to the specific Report's detail page
    async_to_sync(channel_layer.group_send)(
        report_group_name,
        event
    )
    
    print(f"Broadcasted new sighting for Report {sighting_instance.report.id} to groups.")