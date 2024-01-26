
from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        fields = ['id', 'map_object', 'date_from', 'date_to', 'address']

    def create(self, validated_data):
        return Appointment.objects.create(**validated_data)
   

