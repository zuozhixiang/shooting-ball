from django.urls import path
from game.consumers.multiplayer.index import MultiPlayer

# websocket的路由, 
websocket_urlpatterns = [
    path("wss/multiplayer/", MultiPlayer.as_asgi(), name="wss_multiplayer"),

]