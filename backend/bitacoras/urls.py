from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    inicio,
    perfil_usuario,
    cambiar_password,
    administradores_lista,
    UsuarioViewSet,
    OficioComisionViewSet,
    EvidenciaViewSet,
    LugarViewSet,
    BitacoraPasajeViewSet,
)

router = DefaultRouter()
router.register(r"usuarios", UsuarioViewSet)
router.register(r"oficios", OficioComisionViewSet, basename="oficio")
router.register(r"evidencias", EvidenciaViewSet, basename="evidencia")
router.register(r"lugares", LugarViewSet)
router.register(r"bitacoras-pasaje", BitacoraPasajeViewSet, basename="bitacora-pasaje")
router.register(r"bitacoras-pasajes", BitacoraPasajeViewSet, basename="bitacoras-pasajes")

urlpatterns = [
    path("", inicio),
    path("perfil/", perfil_usuario),
    path("perfil/cambiar-password/", cambiar_password),
    path("administradores/", administradores_lista),
    path("", include(router.urls)),
]