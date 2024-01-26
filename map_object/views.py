from django.shortcuts import get_object_or_404
from . serializers import MapObjectSerializer
from rest_framework import generics, status
from .models import MapObject, Address
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Shape, MapObject
from .serializers import ShapeSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .serializers import MapObjectLocationUpdateSerializer, AddressSerializer
from django.contrib.gis.geos import Polygon, LinearRing, Point, GEOSGeometry
from django.core.exceptions import ObjectDoesNotExist


class CheckLocationView(APIView):

    unique_identifier_param_config = openapi.Parameter(
        'unique_identifier', in_=openapi.IN_QUERY, description='Description', type=openapi.TYPE_STRING)

    @swagger_auto_schema(manual_parameters=[unique_identifier_param_config])
    def get(self, request, *args, **kwargs):
        unique_identifier = request.query_params.get('unique_identifier')

        if not unique_identifier:
            return Response({'error': 'unique_identifier is required'}, status=400)

        try:
            map_object = MapObject.objects.get(unique_identifier=unique_identifier)
        except MapObject.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=404)

        if map_object.location:
            return Response({'result': 1}, status=status.HTTP_200_OK)
        else:
            return Response({'result': 0})


class MapObjectLocationUpdateAPIView(generics.UpdateAPIView):
    serializer_class = MapObjectLocationUpdateSerializer
    def get_object(self):
        unique_identifier = self.request.query_params.get('unique_identifier')
        try:
            obj = MapObject.objects.get(unique_identifier=unique_identifier)
            return obj
        except MapObject.DoesNotExist:
            return None
    def update(self, request, *args, **kwargs):
        unique_identifier = self.request.query_params.get('unique_identifier')
        obj = MapObject.objects.get(unique_identifier=unique_identifier)
        data = request.data.get('detailedAddress', {})
        street_number = data.get('streetNumber', '')
        street_name = data.get('streetName', '')
        city = data.get('city', '')
        country = data.get('country', '')
        state = data.get('state', '')
        zip_code = data.get('postalCode', '')
        full_address = f"{street_number} {street_name}".strip()
        formatted_address = data.get('formatted_address', '')
        if not full_address and not formatted_address:
            return Response({'message': 'Both full_address and formatted_address are empty'}, status=status.HTTP_200_OK)
        existing_address = None
        try:
            if formatted_address:
                existing_address = Address.objects.get(formatted_address=formatted_address)
        except ObjectDoesNotExist:
            existing_address = None
        if not existing_address:
            new_address_data = {
                'address_line_1': full_address,
                'formatted_address': formatted_address,
                'city': city,
                'state': state,
                'country': country,
                'zip_code': zip_code
            }
            new_address_serializer = AddressSerializer(data=new_address_data)

            if new_address_serializer.is_valid():
                new_address_serializer.save()
                address_id = new_address_serializer.data['id']
            else:
                return Response({'error': 'Invalid address data'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            address_id = existing_address.id
        instance = self.get_object()
        if instance is None:
            return Response({'error': 'MapObject not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        lat_cood = request.data.get('lat_cood')
        if lat_cood is not None:
            lat = float(lat_cood)
        else:
            map = MapObject.objects.get(unique_identifier=unique_identifier)
            lat = float(map.location[1])
        lng_cood = request.data.get('lng_cood')
        if lng_cood is not None:
            lng = float(lng_cood)
        else:
            map = MapObject.objects.get(unique_identifier=unique_identifier)
            lng = float(map.location[0])
        location = Point(lng, lat)
        instance.location = location
        instance.address_id = address_id
        instance.save()
        return Response({'address_id': address_id}, status=status.HTTP_200_OK)
    

class ShapeCreateAPIView(generics.CreateAPIView):
    serializer_class = ShapeSerializer

    def post(self, request, *args, **kwargs):
        unique_identifier = self.request.query_params.get('unique_identifier')
        try:
            map_object = MapObject.objects.get(unique_identifier=unique_identifier)
        except MapObject.DoesNotExist:
            return Response({"error": "MapObject not found"}, status=status.HTTP_404_NOT_FOUND)
    
        data = Polygon(request.data.get('savedDataList', None))
        if data is None:
            return Response({"error": "Invalid data format"}, status=status.HTTP_400_BAD_REQUEST)

        created_shapes = []

        for shape_data in data:
            coordinates_data = shape_data.pop('coordinates')
            polygon_coords = [(coord['lng'], coord['lat']) for coord in coordinates_data]
            linear_ring = LinearRing(polygon_coords + [polygon_coords[0]])
            polygon = GEOSGeometry(Polygon(linear_ring))
            shape_data['map_object'] = map_object.id
            shape_data['coordinates'] = polygon

            existing_shape = Shape.objects.filter(map_object=map_object, coordinates=polygon)

            if not existing_shape.exists():
                shape_serializer = ShapeSerializer(data=shape_data)
                if shape_serializer.is_valid():
                    shape_serializer.save()
                    created_shapes.append(shape_serializer.data)
                else:
                    return Response(shape_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                created_shapes.extend(existing_shape.values())

        return Response(created_shapes, status=status.HTTP_201_CREATED)

        

class ShapeDataAPIView(APIView):

    unique_identifier_param_config = openapi.Parameter(
        'unique_identifier', in_=openapi.IN_QUERY, description='Description', type=openapi.TYPE_STRING)

    @swagger_auto_schema(manual_parameters=[unique_identifier_param_config])
    def get(self, request, *args, **kwargs):
        unique_identifier = self.request.query_params.get('unique_identifier')
        if not unique_identifier:
            return Response({'error': 'unique_identifier is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            map_object = MapObject.objects.get(unique_identifier=unique_identifier)
        except MapObject.DoesNotExist:
            return Response({'error': 'MapObject not found'}, status=status.HTTP_404_NOT_FOUND)

        map_object_serializer = MapObjectSerializer(map_object)
        address = Address.objects.filter(id=map_object_serializer.data['address'])
        address_serializer = AddressSerializer(address, many=True).data
        shapes = Shape.objects.filter(map_object=map_object)
        shape_serializer = ShapeSerializer(shapes, many=True)

        response_data = {
            'map_object': map_object_serializer.data,
            'shapes': shape_serializer.data,
            'address':address_serializer
        }

        return Response(response_data, status=status.HTTP_200_OK)


class CreateShapeAPIView(APIView):
    def post(self, request):
        unique_identifier = request.data.get('unique_identifier')
        area = request.data.get('area')
        cost = request.data.get('cost')
        id_shape = request.data.get('id_shape')
        coordinates = request.data.get('coordinates')
        print('data',request.data)
        map_object = get_object_or_404(MapObject, unique_identifier=unique_identifier)
        map_object.save()

        polygon_coordinates = [(float(coord['lng']), float(coord['lat'])) for coord in coordinates]
        polygon_coordinates.append(polygon_coordinates[0])

        polygon = Polygon([Point(lon, lat) for lon, lat in polygon_coordinates])

        shape_data = {
            'map_object': map_object.id,
            'area': area,
            'cost': cost,
            'coordinates': polygon, 
            'id_shape': id_shape
        }

        serializer = ShapeSerializer(data=shape_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteShapeAPIView(APIView):
    def delete(self, request):
        unique_identifier = request.query_params.get('unique_identifier')
        print(unique_identifier)
        id_shape = request.query_params.get('id_shape')
        print(id_shape)
        map_object = get_object_or_404(MapObject, unique_identifier=unique_identifier)
        shape = get_object_or_404(Shape, id_shape=id_shape, map_object=map_object)
        shape.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    