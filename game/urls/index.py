from django.contrib import admin
from django.urls import path, include
from game.views.index import index

urlpatterns = [
    path("", index, name="index"),  # 这个将会调用game.views中编写的index.py

    # 下面是吧三个子文件的url, 包括进来
    path("menu/",include("game.urls.menu.index")),
    path("playground/",include("game.urls.playground.index")),
    path("settings/",include("game.urls.settings.index")),
 ]