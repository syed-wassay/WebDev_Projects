from django.contrib.gis.db import models
import uuid
from accounts.models import User


class Address(models.Model):
    address_line_1 = models.TextField(max_length=255, null=True, blank=True)
    formatted_address = models.CharField(max_length=600, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    zip_code = models.CharField(null=True, blank=True)

class MapObject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    unique_identifier = models.UUIDField(default=uuid.uuid4, editable=False)
    location = models.PointField(geography=True, default=None, blank=True, null=True)
    address = models.ForeignKey(Address, on_delete=models.CASCADE, blank=True, null=True, default=None)

    def __str__(self):
        return f"MapObject {self.id}"    

class Shape(models.Model):
    map_object = models.ForeignKey(MapObject, on_delete=models.CASCADE, blank=False, default=None)
    coordinates = models.PolygonField(geography=True, default=None)
    id_shape = models.CharField(max_length=100, unique=True)
    area = models.FloatField(default=None)
    cost = models.FloatField(default=None)

    def __str__(self):
        return f"Shape {self.id}"

