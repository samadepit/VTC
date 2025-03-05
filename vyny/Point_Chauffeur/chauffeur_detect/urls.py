from django.contrib import admin
from django.urls import include, path
from chauffeur_detect import views


urlpatterns = [
    # path("goapp/", views.object_detection_view),
    path('generer-code/', views.generer_code, name='generer_code'),  
    path('verifier-code/', views.verifier_code, name='verifier_code'),  
    path('chauffeurs/', views.add_chauffeur, name='add_chauffeur'),  
    path('verification-chauffeur/', views.verification_chauffeur, name='verification_chauffeur'),
    path('point-recette/', views.add_Point_recette, name='add_point_recette'), 
    path('hello_world/', views.hello_world),
    path('login/', views.api_login),
    path('logout/', views.api_logout),
    path('all-chauffeur/', views.all_chauffeur),
    path('all-recette/', views.all_recette),
    path('delete-chauffeur/<int:id>/', views.delete_chauffeur),
    path('update-chauffeur/<int:id>/', views.update_chauffeur),
    path('update-recette/<int:id>/', views.update_recette),
    path('delete-recette/<int:id>/', views.delete_recette),
    # path('verify-token/', views.VerifyTokenView.as_view(), name='verify-token'),
]