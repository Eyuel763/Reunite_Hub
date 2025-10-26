import json
from channels.generic.websocket import AsyncWebsocketConsumer

# Placeholder Consumer for the main Live Map feed
class ReportLiveFeedConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Join the 'report_live_feed' group
        self.group_name = 'report_live_feed'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the 'report_live_feed' group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Receive message from WebSocket (Frontend sends data)
    async def receive(self, text_data):
        # This consumer is mostly for broadcasting, so receiving data is optional.
        pass

    # Receive message from group (Backend sends data via Celery/View)
    async def report_update(self, event):
        # Send data to WebSocket (Frontend receives data)
        await self.send(text_data=json.dumps({
            'type': event['type'],
            'data': event['data']
        }))

# Placeholder Consumer for a specific Report Detail page
class ReportUpdateConsumer(AsyncWebsocketConsumer):
    # This consumer structure will be similar, but joins a group named 'report_[ID]'
    async def connect(self):
        self.report_id = self.scope['url_route']['kwargs']['report_id']
        self.group_name = f'report_{self.report_id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        pass

    async def sighting_added(self, event):
        await self.send(text_data=json.dumps({
            'type': 'sighting_added',
            'data': event['data']
        }))