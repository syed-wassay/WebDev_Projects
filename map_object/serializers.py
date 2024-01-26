from .models import MapObject, Address
from rest_framework import serializers
from .models import Shape
from django.contrib.gis.geos import Point



class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapObject
        fields = '__all__'


    def create(self, validated_data):
        return MapObject.objects.create_user(**validated_data)
    
    
class MapObjectSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()

    class Meta:
        model = MapObject
        fields = ['id', 'user', 'unique_identifier', 'location', 'address']

    def get_location(self, obj):
        return [obj.location.x, obj.location.y]
    

class MapObjectLocationUpdateSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()

    class Meta:
        model = MapObject
        fields = ['location']

    def get_location(self, obj):
        return {'lat': obj.location.y, 'lng': obj.location.x}
    
    def to_internal_value(self, data):
        location_data = data.get('location', {})
        location = Point(float(location_data.get('lng', 0)), float(location_data.get('lat', 0)))
        return {'location': location}
    

class ShapeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shape
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['coordinates'] = list(instance.coordinates.coords[0])
        return representation


class AddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Address
        fields = ['id','address_line_1', 'formatted_address', 'city', 'state', 'country', 'zip_code']