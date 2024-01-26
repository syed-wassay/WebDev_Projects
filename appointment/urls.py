from django.urls import path
from .views import AppointmentCreateAPIView, AppointmentDetailsView

urlpatterns = [
    path('create/', AppointmentCreateAPIView.as_view(), name='create-appointment'),
    path('appointment-details/', AppointmentDetailsView.as_view(), name='appointment-details')
]
