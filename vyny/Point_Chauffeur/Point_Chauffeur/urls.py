from django.contrib import admin
from django.urls import path, include
from jet_django.urls import jet_urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('chauffeur_detect.urls')),  # Votre application
    path('jet_api/', include(jet_urls)),  # Jet Django
]
