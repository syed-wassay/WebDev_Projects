
from django.urls import path
from .views import ShapeCreateAPIView, MapObjectLocationUpdateAPIView, CheckLocationView, ShapeDataAPIView, CreateShapeAPIView, DeleteShapeAPIView

urlpatterns = [
    path('api/shapes/', ShapeCreateAPIView.as_view(), name='add-shapes'),
    path('api/map_object/update/', MapObjectLocationUpdateAPIView.as_view()),
    path('api/check_location/', CheckLocationView.as_view()),
    path('api/data/', ShapeDataAPIView.as_view()),
    path('create-shape/', CreateShapeAPIView.as_view(), name='create_shape'),
    path('delete-shape/', DeleteShapeAPIView.as_view(), name='delete_shape')

]
