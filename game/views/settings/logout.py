from django.contrib.auth import logout
from django.http import JsonResponse

def log_out(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'res': 'success'
        })
    logout(request)
    return JsonResponse({
        'res': 'success'
    })
