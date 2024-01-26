import os
from django.contrib.gis.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from rest_framework_simplejwt.tokens import RefreshToken
from phonenumber_field.modelfields import PhoneNumberField
from dotenv import load_dotenv

load_dotenv()

class UserManager(BaseUserManager):
    def create_user(self, email, construction_type=None, *args, **kwargs): 
        if email is None:
            raise TypeError('Users should have an email')

        user = self.model(
            email=self.normalize_email(email),
            construction_type=construction_type
        )

        if 'password' in kwargs and kwargs['password']:
            user.set_password(kwargs['password'])
        
        else:
            password = str(os.getenv('DEFAULT_PASSWORD_FOR_USERS'))
            user.set_password(password)

        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None):
        if password is None:
            raise TypeError('Password should not be none')

        user = self.create_user(
            email=email,
        )
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.is_admin = True
        user.is_verified = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=255, blank=True)
    firstName = models.CharField(max_length=100, blank=True, default=username)
    lastName = models.CharField(max_length=100, blank=True, default=username)
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    phone = PhoneNumberField(null=True, blank=True)
    construction_type = models.CharField(max_length=11, choices=(
        ('Residential', 'Residential'),
        ('Commercial', 'Commercial')), null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    auth_provider = models.CharField(
        max_length=255, blank=False,
        null=False, default='email')

    USERNAME_FIELD = 'email'

    objects = UserManager()

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email.split("@")[0]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email

    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }