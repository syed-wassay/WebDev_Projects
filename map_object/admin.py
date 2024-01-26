from django.contrib import admin
from .models import MapObject, Shape, Address

class MapsAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'unique_identifier', 'location']


class ShapesAdmin(admin.ModelAdmin):
    list_display = ['id', 'map_object','id_shape', 'coordinates', 'area', 'cost']
    
class AddressAdmin(admin.ModelAdmin):
    list_display = ['id', 'address_line_1', 'city', 'state', 'country', 'zip_code', 'formatted_address']

admin.site.register(MapObject, MapsAdmin)
admin.site.register(Shape, ShapesAdmin)
admin.site.register(Address, AddressAdmin)
