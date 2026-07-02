from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
def inicio(request):
    return Response({"mensaje": "API funcionando"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil_usuario(request):
    user = request.user
    roles = user.groups.values_list('name', flat=True)

    return Response({
        "username": user.username,
        "roles": list(roles)
    })