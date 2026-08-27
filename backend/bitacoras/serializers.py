from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from .models import Usuario, OficioComision, Evidencia, Lugar, BitacoraPasaje


class UsuarioSerializer(serializers.ModelSerializer):
    id_usuario = serializers.IntegerField(source="id", read_only=True)
    nombre_completo = serializers.CharField(source="nombre")
    username = serializers.CharField(source="usuario.username", read_only=True)
    activo = serializers.SerializerMethodField()
    password_temporal = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            "id_usuario", "nombre_completo", "correo", "username",
            "cargo", "rol", "activo", "estado", "password_temporal",
        ]

    def get_activo(self, obj):
        return obj.estado == "Activo"

    def get_password_temporal(self, obj):
        return getattr(obj, "_password_temporal", None)

    def create(self, validated_data):
        username = self.initial_data.get("username")
        password = self.initial_data.get("password")

        if not username:
            raise serializers.ValidationError({"username": "Este campo es obligatorio."})
        if not password:
            raise serializers.ValidationError({"password": "Este campo es obligatorio."})
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "Ya existe un usuario con ese nombre."})

        user = User.objects.create_user(
            username=username,
            email=validated_data.get("correo") or "",
            password=password,
        )

        activo = self.initial_data.get("activo")
        if activo is not None:
            validated_data["estado"] = "Activo" if activo else "Inactivo"

        usuario = Usuario.objects.create(usuario=user, **validated_data)
        return usuario

    def update(self, instance, validated_data):
        activo = self.initial_data.get("activo")
        if activo is not None:
            instance.estado = "Activo" if activo else "Inactivo"
        return super().update(instance, validated_data)


class OficioComisionSerializer(serializers.ModelSerializer):
    id_oficio = serializers.IntegerField(source="id", read_only=True)
    folio = serializers.SerializerMethodField()
    fecha = serializers.DateField(source="fecha_emision", read_only=True)
    lugar = serializers.CharField(source="lugar_destino.nombre_lugar", read_only=True)
    solicitante = serializers.CharField(source="nombre_comisionado", read_only=True)
    total_evidencias = serializers.SerializerMethodField()

    id_lugar = serializers.PrimaryKeyRelatedField(
        queryset=Lugar.objects.all(), source="lugar_destino", write_only=True
    )

    class Meta:
        model = OficioComision
        fields = [
            "id_oficio", "folio", "fecha", "lugar", "solicitante", "estado", "total_evidencias",
            "fecha_emision", "lugar_expedicion", "funcionario_autorizador", "cargo_autorizador",
            "adscripcion", "fecha_traslado", "motivo_comision", "nombre_comisionado",
            "cargo_comisionado", "id_lugar",
        ]

    def get_folio(self, obj):
        return f"OC-{obj.id:04d}"

    def get_total_evidencias(self, obj):
        return obj.evidencia_set.count()


class EvidenciaSerializer(serializers.ModelSerializer):
    id_evidencia = serializers.IntegerField(source="id", read_only=True)
    id_oficio = serializers.PrimaryKeyRelatedField(
        queryset=OficioComision.objects.all(), source="oficio"
    )

    class Meta:
        model = Evidencia
        fields = ["id_evidencia", "archivo", "fecha_subida", "id_oficio"]


class LugarSerializer(serializers.ModelSerializer):
    id_lugar = serializers.IntegerField(source="id", read_only=True)
    nombre = serializers.CharField(source="nombre_lugar")

    class Meta:
        model = Lugar
        fields = ["id_lugar", "nombre", "ubicacion"]


class BitacoraPasajeSerializer(serializers.ModelSerializer):
    id_bitacora = serializers.IntegerField(source="id", read_only=True)
    origen_nombre = serializers.CharField(source="origen.nombre_lugar", read_only=True)
    destino_nombre = serializers.CharField(source="destino.nombre_lugar", read_only=True)

    id_origen = serializers.PrimaryKeyRelatedField(
        queryset=Lugar.objects.all(), source="origen", write_only=True
    )
    id_destino = serializers.PrimaryKeyRelatedField(
        queryset=Lugar.objects.all(), source="destino", write_only=True
    )

    autoriza_1 = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), required=False, allow_null=True
    )
    autoriza_2 = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), required=False, allow_null=True
    )
    autoriza_3 = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = BitacoraPasaje
        fields = [
            "id_bitacora", "fecha", "total", "persona_gasto", "descripcion",
            "estado", "fecha_registro", "tipo_pasaje",
            "origen_nombre", "destino_nombre", "id_origen", "id_destino",
            "autoriza_1", "autoriza_2", "autoriza_3",
        ]
        
class AdministradorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["id", "nombre", "cargo"]