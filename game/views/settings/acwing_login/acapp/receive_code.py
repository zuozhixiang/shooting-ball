from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player 
from django.http import JsonResponse

from random import randint

def receive_code(request):
    data = request.GET

    if "errcode" in data:
        return JsonResponse({
            'res': 'apply failed',
            'errcode': data['errcode'],
            'errmsg': data['errmsg'],
        })
    # 获取code 和state , 这个state, 是有apply_code 产生的, 然后发给acwing, 然后acwing又发给receive_code
    code = data.get('code')
    state = data.get('state')
    # 如果redis 里面没有这个state, 说明不是acwing 发来的请求
    if not cache.has_key(state):
        return JsonResponse({
            'res': 'state not exist', 

        })
    
    # 这次state, 用完了, 从redis 里面删除
    cache.delete(state)


    # 然后通过code , 来向acwing获取  允许登录的token和openid
    app_secret = "7e7542613f774319a4bb2862a2a3ebba"
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    appid = '2989'

    params = {
        'appid': appid,
        'secret': app_secret,
        'code': code,
    }

    # token 和openid
    access_token_res = requests.get(apply_access_token_url, params=params).json()

    access_token = access_token_res['access_token']
    openid = access_token_res['openid']
    
    # 判断用户是否已经存在, 通过openid来判断
    players = Player.objects.filter(openid=openid)
    if players.exists(): # 如果存在
        player = players[0]
        return JsonResponse({
            'res': 'success',
            'username': player.user.username,
            'photo': player.photo,
        })
    
    # 如果不存在的话, 通过token和openid 获取用户的信息
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        'access_token': access_token,
        'openid': openid,
    }

    userinfo_res = requests.get(get_userinfo_url, params=params).json()

    username = userinfo_res['username']
    photo = userinfo_res['photo']

    # 如果用户名存在的话, 就在他的名字基础上面不断的加一位
    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))

    # 创建user 和player 
    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    # 重定向到 首页, 就会自动登录了
    return JsonResponse({
            'res': 'success',
            'username': player.user.username,
            'photo': player.photo,
        })
