from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Usuario, OficioComision, Evidencia, Lugar, BitacoraPasaje
from .serializers import (
    UsuarioSerializer, OficioComisionSerializer, EvidenciaSerializer,
    LugarSerializer, BitacoraPasajeSerializer,AdministradorSerializer,
)
from django.contrib.auth.hashers import check_password

@api_view(['GET'])
def inicio(request):
    return Response({"mensaje": "API funcionando"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil_usuario(request):
    try:
        usuario = Usuario.objects.select_related("usuario").get(usuario=request.user)
    except Usuario.DoesNotExist:
        return Response({"detail": "No se encontró el perfil de este usuario."}, status=404)

    serializer = UsuarioSerializer(usuario)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def administradores_lista(request):
    admins = Usuario.objects.filter(rol="Administrador", estado="Activo")
    serializer = AdministradorSerializer(admins, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cambiar_password(request):
    password_actual = request.data.get("password_actual")
    password_nueva = request.data.get("password_nueva")

    if not password_actual or not password_nueva:
        return Response({"detail": "Debes proporcionar la contraseña actual y la nueva."}, status=400)

    user = request.user

    if not check_password(password_actual, user.password):
        return Response({"detail": "La contraseña actual no es correcta."}, status=400)

    if len(password_nueva) < 8:
        return Response({"detail": "La nueva contraseña debe tener al menos 8 caracteres."}, status=400)

    user.set_password(password_nueva)
    user.save()

    return Response({"detail": "Contraseña actualizada correctamente."})
    
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.select_related("usuario").all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        user = instance.usuario
        instance.delete()
        user.delete()

class OficioComisionViewSet(viewsets.ModelViewSet):
    serializer_class = OficioComisionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = OficioComision.objects.select_related("lugar_destino", "usuario").all()

        try:
            usuario_perfil = Usuario.objects.get(usuario=self.request.user)
        except Usuario.DoesNotExist:
            return queryset.none()

        if usuario_perfil.rol == "Administrador":
            return queryset

        return queryset.filter(usuario=usuario_perfil)

    def perform_create(self, serializer):
        usuario_perfil = Usuario.objects.get(usuario=self.request.user)
        serializer.save(usuario=usuario_perfil)


class EvidenciaViewSet(viewsets.ModelViewSet):
    serializer_class = EvidenciaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Evidencia.objects.select_related("oficio").all()
        id_oficio = self.request.query_params.get("id_oficio")
        if id_oficio:
            queryset = queryset.filter(oficio_id=id_oficio)
        return queryset
    
class LugarViewSet(viewsets.ModelViewSet):
    queryset = Lugar.objects.all()
    serializer_class = LugarSerializer
    permission_classes = [IsAuthenticated]
    
class BitacoraPasajeViewSet(viewsets.ModelViewSet):
    serializer_class = BitacoraPasajeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = BitacoraPasaje.objects.select_related("origen", "destino", "usuario").all()

        try:
            usuario_perfil = Usuario.objects.get(usuario=self.request.user)
        except Usuario.DoesNotExist:
            return queryset.none()

        if usuario_perfil.rol == "Administrador":
            return queryset

        return queryset.filter(usuario=usuario_perfil)

    def perform_create(self, serializer):
        usuario_perfil = Usuario.objects.get(usuario=self.request.user)
        serializer.save(usuario=usuario_perfil)
