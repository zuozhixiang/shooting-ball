from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache


def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    appid = "2922"
    # 将申请code的链接的重新编码一下
    redirect_uri = quote("https://app2922.acapp.acwing.com.cn/settings/acwing/acapp/receive_code/") 
    scope = "userinfo"
    state = get_state()

    # 将这个随机值放到redis里面, 三个参数分别是key, value, 保存时间
    cache.set(state, True, 2 * 60 * 60)

    return JsonResponse({
        'res': "success",
        'appid': appid,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
    })

