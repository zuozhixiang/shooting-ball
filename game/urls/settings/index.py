from django.urls import path, include
from game.views.settings.getInfo import getInfo
from game.views.settings.login import sign
from game.views.settings.logout import log_out
from game.views.settings.register import register

urlpatterns = [
    path("getInfo/", getInfo, name="settings_getInfo"),
    path("login/", sign, name="settings_sign"),
    path("logout/", log_out, name="settings_logout"),
    path("register/", register, name="settings_register"),
    path("acwing/", include("game.urls.settings.acwing.index")),

]