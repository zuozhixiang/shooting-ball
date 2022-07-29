from django.contrib.auth import login
from django.http import JsonResponse
from django.contrib.auth.models import User 
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get('username', "").strip()
    password = data.get('password', "").strip()
    repassword = data.get('repassword', "").strip()

    if not username or not password or not repassword:
        return JsonResponse({
            'res': '用户和密码不能为空'
        })

    if password != repassword:
        return JsonResponse({
            'res': '两次密码不一致'
        })

    if User.objects.filter(username=username).exists():
       return JsonResponse({
            'res': '用户已经存在'
       })

    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="https://cdn.acwing.com/media/user/profile/photo/29171_lg_a02dcd8049.jpg")
    
    login(request, user)
    return JsonResponse({
        'res': 'success'
    })