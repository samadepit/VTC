from rest_framework import serializers
from .models import Chauffeurs, Point_Recette, Code_Verification


class ChauffeurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chauffeurs
        # fields = ['id', 'nom', 'prenom', 'date_naissance', 'lieu_naissance', 'sexe','situation_matrimoniale','numero_CNI','numero_tel','lieu_habitation','personne_en_cas_urgence','num_en_cas_urgence','photo','embedding']
        fields = '__all__'

class PointRecetteSerializer(serializers.ModelSerializer):
    chauffeur_nom = serializers.CharField(source='Chauffeur_id.nom', read_only=True)
    chauffeur_prenom = serializers.CharField(source='Chauffeur_id.prenom', read_only=True)
    chauffeur_id = serializers.PrimaryKeyRelatedField(queryset=Chauffeurs.objects.all(), source='Chauffeur_id')

    class Meta:
        model = Point_Recette
        fields = ['id', 'Recette', 'date_de_point', 'chauffeur_id', 'chauffeur_nom', 'chauffeur_prenom','immatriculation_auto','km']


class CodeVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Code_Verification
        fields = '__all__'
