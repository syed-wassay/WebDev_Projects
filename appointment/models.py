from django.db import models
from map_object.models import MapObject, Address
from accounts.models import User


class Appointment(models.Model):
    map_object = models.ForeignKey(MapObject, on_delete=models.CASCADE, default=None)
    address = models.ForeignKey(Address, on_delete=models.CASCADE, default=None)
    date_from = models.DateTimeField()
    date_to = models.DateTimeField()
