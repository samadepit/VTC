from django.db import models
from random import randint
from datetime import timedelta, datetime

# Create your models here.
class Chauffeurs(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    sexe = models.CharField(max_length=1)
    photo = models.ImageField(upload_to='photos_clients/', null=False, blank=False) #quand c TRUE c kil est falcultatif
    embedding = models.BinaryField(null=True, blank=True)

    def __str__(self):
        return f"{self.prenom} {self.nom}" 
class Point_Recette(models.Model):
    Chauffeur_id = models.ForeignKey(Chauffeurs,related_name='presences',on_delete=models.CASCADE)#on_delete surpime lorsque le parent est suprimé
    Recette = models.IntegerField()
    date_de_point = models.DateTimeField(auto_now_add=True) #prendre la date actu pour l'enregistré directement
    immatriculation_auto=models.CharField(max_length=14)
    def __str__(self):
        return f"Présence de {self.Chauffeur_id} le {self.date_de_point.strftime('%Y-%m-%d %H:%M:%S')} recettte: {self.Recette} vehicule:{self.immatriculation_auto}"
from django.utils import timezone

class Code_Verification(models.Model):
    code = models.IntegerField()
    date_de_point = models.DateTimeField(auto_now_add=True)
    utilise = models.BooleanField(default=False)
    expiration = models.DateTimeField()

    def est_valide(self):
        """
        Vérifie si le code est encore valide :
        - Pas expiré
        - Pas encore utilisé
        """
        return timezone.now() <= self.expiration and not self.utilise

    def __str__(self):
        return f"Code: {self.code}, Expire: {self.expiration}, Utilisé: {self.utilise}"