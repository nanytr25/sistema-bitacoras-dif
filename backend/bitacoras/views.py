from django.shortcuts import render

from django.http import JsonResponse

def inicio(request):
    return JsonResponse({
        "mensaje": "API del Sistema de Bitácoras funcionando"
    })
