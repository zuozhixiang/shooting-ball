from django.contrib.auth import authenticate, login
from django.http import JsonResponse

def sign(request):
    data = request.GET
    username = data.get('username')
    password = data.get('password')
    user = authenticate(username=username, password=password)
    if not user:
        return JsonResponse({
            'res': "用户名或者密码不正确"
        })
    login(request, user)  # 
    return JsonResponse({
        'res': "success"
    })
    
