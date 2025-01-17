from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from django.shortcuts import redirect
from .models import Code_Verification
from .views import generer_code

class CodeVerificationAdmin(admin.ModelAdmin):
    list_display = ('code', 'expiration', 'utilise')
    actions = ['generate_verification_code']

    def generate_verification_code(self, request, queryset):
        # Appelez la fonction generer_code depuis la vue
        response = generer_code(request)
        return JsonResponse(response.json())

    generate_verification_code.short_description = "Générer un code de vérification"

admin.site.register(Code_Verification, CodeVerificationAdmin)
# Register your models here.
