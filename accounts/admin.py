from django.contrib import admin
from .models import User


class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'firstName', 'lastName', 'phone',  'email', 'auth_provider', 'created_at']


admin.site.register(User, UserAdmin)
