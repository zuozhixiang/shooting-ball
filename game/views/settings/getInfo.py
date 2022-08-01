from django.http import JsonResponse
from game.models.player.player import Player



def getinfo_acapp(request):
    player = Player.objects.all()[0]
    return JsonResponse({
        'res': "success",
        'username': player.user.username,
        'photo': player.photo,
    })



def getinfo_web(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'res': "未登录"
        })
    else:
        player = Player.objects.get(user=user)
        return JsonResponse({
            'res': "success",
            'username': player.user.username,
            'photo': player.photo,
        })



def getInfo(request):
    platform = request.GET.get('platform')
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)
