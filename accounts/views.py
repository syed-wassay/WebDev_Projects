import os
from rest_framework import generics, status, views
from .serializers import (
    EmailVerificationSerializer,
    AdminRegisterSerializer,
    AdminLoginSerializer,
    )
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
import jwt
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .utils import Util
from django.http import HttpResponsePermanentRedirect
from dotenv import load_dotenv
from map_object.models import MapObject
from map_object.serializers import MapSerializer
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from djoser.views import UserViewSet
import djoser

load_dotenv()


class CustomRedirect(HttpResponsePermanentRedirect):

    allowed_schemes = [os.getenv('APP_SCHEME'), 'http', 'https']


class CustomUserRegistrationView(UserViewSet):
    def create_map_object(self, user):
        map_object_instance = MapObject.objects.create(user=user, location='POINT(0 0)' , address=None)
        map_serializer = MapSerializer(map_object_instance)
        unique_identifier = map_serializer.data.get('unique_identifier', None)
        return unique_identifier, map_serializer.data

    def perform_create(self, user, is_new_user):
        token = RefreshToken.for_user(user).access_token
        unique_identifier, map_data = self.create_map_object(user)
        absurl = str(os.getenv("FRONTEND_URL")) + f"/verification/?token={str(token)}&unique_identifier={unique_identifier}"
        
        email_subject = 'Verify your email'
        email_title = 'Email Confirmation'
        email_body = 'Click the button below to verify your email'

        if not is_new_user:
            email_subject = 'Welcome back!'
            email_title = ''
            email_body = 'Use the link below to open a new map'

        Util.send_verification_email(
            email=user.email, absurl=absurl,
            username=user.username, subject=email_subject,
            email_body=email_body, email_title=email_title
        )

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        
        try:
            user = User.objects.get(email=email)
            is_new_user = False
            self.perform_create(user, is_new_user)
        except User.DoesNotExist:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            is_new_user = True
            self.perform_create(user, is_new_user)

        if is_new_user:
            response_message = 'User registered successfully'
        else:
            response_message = 'Email sent to existing user'

        return Response({'message': response_message}, status=status.HTTP_201_CREATED)


class VerifyEmail(views.APIView):
    serializer_class = EmailVerificationSerializer

    token_param_config = openapi.Parameter(
        'token', in_=openapi.IN_QUERY, description='Description', type=openapi.TYPE_STRING)

    @swagger_auto_schema(manual_parameters=[token_param_config])
    def get(self, request):
        token = request.GET.get('token')
        print(f'token : {token}')
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.get(id=payload['user_id'])
            if not user.is_verified:
                user.is_verified = True
                user.save()
                return Response({'email': 'Successfully activated'}, status=status.HTTP_200_OK)
            elif user.is_verified:
                return Response({'message': 'email already verified'}, status=status.HTTP_200_OK) 
        except jwt.ExpiredSignatureError as identifier:
            print(f'expired: {identifier}')
            return Response({'error': 'Activation Expired'}, status=status.HTTP_400_BAD_REQUEST)
        except jwt.exceptions.DecodeError as identifier:
            print(f'invalid: {identifier}')
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist as identifier:
            print(f'User does not exist: {identifier}')
            return Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)


class GetEmailView(views.APIView):

    id_param_config = openapi.Parameter(
        'id', in_=openapi.IN_QUERY, description='Description', type=openapi.TYPE_STRING)

    @swagger_auto_schema(manual_parameters=[id_param_config])
    def get(self, request):
        try:
            uid = int(request.query_params.get('id'))
        except:
            return Response({'error': 'id is not correct'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(User, id=uid)
        phone_str = str(user.phone) if user.phone else None
        data = {
            'email' : user.email,
            'first_name' : user.firstName,
            'last_name' : user.lastName,
            'phone' : phone_str
        }
        return JsonResponse(data=data, status=status.HTTP_200_OK)


class AdminRegistrationView(views.APIView):
    @swagger_auto_schema(request_body=AdminRegisterSerializer)
    def post(self, request):
        email = request.data.get("email")

        if email is not None:
            serializer = AdminRegisterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                user_data = serializer.data
                user = User.objects.get(email=user_data["email"])
                token = RefreshToken.for_user(user).access_token
                return Response(user_data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"message": "email not provided"}, status=status.HTTP_400_BAD_REQUEST)


class AdminLoginView(generics.GenericAPIView):
    serializer_class = AdminLoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TokenObtainPairView(views.APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")

        if not password:
            password = os.getenv('DEFAULT_PASSWORD_FOR_USERS')


        if not email or not password:
            return Response({'error': 'Both email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'No user with provided email.'}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            return Response({'error': 'Invalid password.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        return Response(tokens, status=status.HTTP_200_OK)
