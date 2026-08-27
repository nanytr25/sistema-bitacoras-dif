from django.db import models
from django.contrib.auth.models import User


# ==========================
# PERFIL DEL USUARIO
# ==========================

class Usuario(models.Model):

    ROLES = (
        ("Administrador", "Administrador"),
        ("Capturista", "Capturista"),
    )

    usuario = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    nombre = models.CharField(
        max_length=255
    )

    correo = models.EmailField(
        max_length=255,
        blank=True,
        null=True
    )

    cargo = models.CharField(
        max_length=100
    )

    rol = models.CharField(
        max_length=50,
        choices=ROLES
    )

    estado = models.CharField(
        max_length=50,
        default="Activo"
    )


    def __str__(self):
        return self.nombre



# ==========================
# LUGAR
# ==========================

class Lugar(models.Model):

    nombre_lugar = models.CharField(
        max_length=100
    )

    ubicacion = models.CharField(
        max_length=150
    )


    def __str__(self):
        return self.nombre_lugar



# ==========================
# BITACORA DE PASAJE
# ==========================

class BitacoraPasaje(models.Model):

    ESTADOS = (
        ("Pendiente","Pendiente"),
        ("Aprobado","Aprobado"),
        ("Rechazado","Rechazado"),
    )
    TIPOS_PASAJE = (
        ("Local", "Local"),
        ("Foráneo", "Foráneo"),
    )

    tipo_pasaje = models.CharField(
        max_length=20,
        choices=TIPOS_PASAJE,
        default="Foráneo"
    )

    autoriza_1 = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="autorizaciones_1"
    )

    autoriza_2 = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="autorizaciones_2"
    )

    autoriza_3 = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="autorizaciones_3"
    )


    fecha = models.DateField()

    total = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    persona_gasto = models.CharField(
        max_length=255
    )

    descripcion = models.TextField(
        blank=True,
        null=True
    )

    estado = models.CharField(
        max_length=50,
        choices=ESTADOS,
        default="Pendiente"
    )

    fecha_registro = models.DateTimeField(
        auto_now_add=True
    )


    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE
    )


    origen = models.ForeignKey(
        Lugar,
        related_name="salidas",
        on_delete=models.CASCADE
    )


    destino = models.ForeignKey(
        Lugar,
        related_name="llegadas",
        on_delete=models.CASCADE
    )
    


    def __str__(self):
        return f"Bitácora {self.id}"



# ==========================
# OFICIO DE COMISION
# ==========================

class OficioComision(models.Model):

    ESTADOS = (
        ("Pendiente","Pendiente"),
        ("Aprobado","Aprobado"),
        ("Rechazado","Rechazado"),
    )


    fecha_emision = models.DateField()

    lugar_expedicion = models.CharField(
        max_length=150
    )


    funcionario_autorizador = models.CharField(
        max_length=255
    )


    cargo_autorizador = models.CharField(
        max_length=100
    )


    adscripcion = models.CharField(
        max_length=255
    )


    fecha_traslado = models.DateField()


    motivo_comision = models.TextField()


    nombre_comisionado = models.CharField(
        max_length=255
    )


    cargo_comisionado = models.CharField(
        max_length=100
    )


    estado = models.CharField(
        max_length=50,
        choices=ESTADOS,
        default="Pendiente"
    )


    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE
    )


    lugar_destino = models.ForeignKey(
        Lugar,
        on_delete=models.CASCADE
    )


    def __str__(self):
        return self.nombre_comisionado



# ==========================
# EVIDENCIA
# ==========================

class Evidencia(models.Model):

    archivo = models.FileField(
        upload_to="evidencias/"
    )


    fecha_subida = models.DateTimeField(
        auto_now_add=True
    )


    oficio = models.ForeignKey(
        OficioComision,
        on_delete=models.CASCADE
    )


    def __str__(self):
        return self.archivo.name