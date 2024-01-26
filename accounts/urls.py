
from django.urls import path
from . views import VerifyEmail, GetEmailView, AdminLoginView, AdminRegistrationView, TokenObtainPairView, CustomUserRegistrationView


urlpatterns = [
    path("verify_email/", VerifyEmail.as_view(), name='verify-email'),
    path("get-email/", GetEmailView.as_view(), name='get-email'),
    path("admin-register/", AdminRegistrationView.as_view(), name='admin-register'),
    path("admin-login/", AdminLoginView.as_view(), name='admin-login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("register/", CustomUserRegistrationView.as_view({'post': 'create'}), name="register")
]
