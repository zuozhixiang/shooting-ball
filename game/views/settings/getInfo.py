from django.http import JsonResponse
from game.models.player.player import Player

def getInfo_acapp(request):
    player = Player.objects.all()[0]
    return JsonResponse({
        'res': 'success',
        'username': player.user.username,
        'photo': player.photo
    })

def getInfo_web(request):
    player = Player.objects.all()[0]
    return JsonResponse({
        'res': 'success',
        'username': player.user.username,
        'photo': player.photo
    })

def getInfo(request):
    user = request.user
    platform = request.GET.get('platform')
    if platform == "ACAPP":
        return getInfo_acapp(request)
    if not user.is_authenticated:
        return JsonResponse({
            'res': '未登录',
        })
    if platform == "WEB":
        return getInfo_web(request)

    
