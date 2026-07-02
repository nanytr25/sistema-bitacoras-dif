from django.urls import path
from .views import inicio, perfil_usuario

urlpatterns = [
    path('', inicio),
    path('perfil/', perfil_usuario),
]