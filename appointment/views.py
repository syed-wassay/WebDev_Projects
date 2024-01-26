from rest_framework import generics
from .serializers import AppointmentSerializer
from map_object.models import MapObject, Shape, Address
from map_object.serializers import MapObjectSerializer, ShapeSerializer, AddressSerializer
from accounts.serializers import UserSerializer
from rest_framework.response import Response
from rest_framework import status
from .utils import Util
from .models import Appointment
from django.shortcuts import get_object_or_404
from accounts.models import User



class AppointmentCreateAPIView(generics.CreateAPIView):
    serializer_class = AppointmentSerializer
    def create(self, request, *args, **kwargs):
        data = request.data
        unique_identifier = request.query_params.get('unique_identifier')
        map_object = get_object_or_404(MapObject, unique_identifier=unique_identifier)
        address_id = data.get('address')
        user_id = map_object.user.id
        address_instance= Address.objects.get(id=address_id)
        address = AddressSerializer(address_instance).data
        existing_appointment = Appointment.objects.filter(map_object=map_object)
       
        if existing_appointment:
            existing_appointment = get_object_or_404(Appointment, map_object=map_object)
            serializer = AppointmentSerializer(existing_appointment, data=data)
        else:
            data['map_object'] = map_object.id
            serializer = AppointmentSerializer(data=data)
        if serializer.is_valid():
            appointment = serializer.save()
            user = get_object_or_404(User, id=user_id)
            user.firstName = data.get('firstName', user.firstName)
            user.lastName = data.get('lastName', user.lastName)
            user.phone = data.get('phone', user.phone)
            user.save()
            appointment_data = {
                    'first_name': user.firstName,
                    'last_name': user.lastName,
                    'phone': user.phone,
                    'address': address['formatted_address'],
                    'date_from': appointment.date_from,
                    'date_to': appointment.date_to,
                    'email_subject': '',
                    'to_email': user.email,
                    'message': ''
                }
            if existing_appointment:
                message = f'Thank you, {user.firstName}, for updating your appointment with us. Your updated appointment details are:\n\n'
                data = {'email_body': message, 'to_email': user.email,
                        'email_subject': 'Appointment Update'}
                appointment_data['email_subject'] = 'Appointment Update'
                appointment_data['message'] = message
            else:
                message = f'Thank you, {user.firstName}, for booking an appointment with us. Your appointment details are:\n\n'
                data = {'email_body': message, 'to_email': user.email,
                        'email_subject': 'Appointment Confirmation'}
                appointment_data['email_subject'] = 'Appointment Confirmation'
                appointment_data['message'] = message
            Util.send_appointment_email(data=appointment_data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
        
class AppointmentDetailsView(generics.RetrieveAPIView):
    def get(self, request, *args, **kwargs):
        try:
            appointments = []

            for apt in Appointment.objects.all():
                appointment_data = AppointmentSerializer(apt).data
                map_object = get_object_or_404(MapObject, id=appointment_data['map_object'])
                print(appointment_data)
                user = map_object.user
                user_data = UserSerializer(user).data

                address = get_object_or_404(Address, id=appointment_data['address'])
                shapes = Shape.objects.filter(map_object=map_object)
                print(f'shape : {shapes}')
                address_data = AddressSerializer(address).data
                map_object_data = MapObjectSerializer(map_object).data
                shapes_data = ShapeSerializer(shapes, many=True).data
                data = {
                    'appointment': appointment_data,
                    'address': address_data,
                    'map_object': map_object_data,
                    'shape': shapes_data,
                    'user': user_data  
                }
                appointments.append(data)
            return Response(appointments, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
