from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponseRedirect
from rest_framework.decorators import api_view , permission_classes , authentication_classes
import base64
import os
import uuid
from .auth_face import face_app
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import ChauffeurSerializer,PointRecetteSerializer,CodeVerificationSerializer
from .models import Chauffeurs,Point_Recette,Code_Verification
from rest_framework import serializers
from rest_framework import status
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .auth_face import utils,face_app
#generate_emb
from .auth_face.face_app import generate_emb, get_similarity
from .auth_face.utils import EmbeddingsDataset
from random import randint
from rest_framework.authtoken.serializers import AuthTokenSerializer
from django.contrib.auth import login, logout
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.permissions import IsAuthenticated , AllowAny
from rest_framework.authentication import TokenAuthentication


@api_view(['GET'])
def hello_world(request):
    return JsonResponse({"message": "Méthode autorisée."}, status=200)


@api_view(['POST'])
def generer_code(request):
    code = randint(1000, 9999)  # Génère un code entre 1000 et 9999
    verification_code = Code_Verification.objects.create(
        code=code,
        expiration=datetime.now() + timedelta(minutes=10),
        utilise=False  # Ajouter un état initial si nécessaire
    )
    return Response(
        {
            "message": "Code généré avec succès.",
            "code": verification_code.code,
            "expiration": verification_code.expiration.strftime("%Y-%m-%d %H:%M:%S"),
        },
        status=status.HTTP_201_CREATED
    )

# @api_view(['POST'])
# def verifier_code(request):
#     code_entre = request.data.get('code')  # Récupère le code envoyé dans la requête
#     if not code_entre:
#         return Response({"error": "Le code est requis."}, status=status.HTTP_400_BAD_REQUEST)
    
#     try:
#         code = Code_Verification.objects.get(code=code_entre)
#         if code.est_valide():
#             # Optionnel : Marquer le code comme utilisé si cela est nécessaire
#             code.utilise = True
#             code.save()
#             return Response({"message": "Code valide."}, status=status.HTTP_200_OK)
#         else:
#             return Response({"message": "Code invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)
#     except Code_Verification.DoesNotExist:
#         return Response({"message": "Code inexistant."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def verifier_code(request):
    """
    Vérifie si un code est valide.
    """
    code_entre = request.data.get('code')  # Récupère le code envoyé dans la requête

    if not code_entre:
        return Response(
            {"success": False, "message": "Le code est requis."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Rechercher le code dans la base de données
        code = Code_Verification.objects.get(code=code_entre)

        # Vérifier la validité du code
        if code.est_valide():
            # Marquer comme utilisé si valide
            code.utilise = True
            code.save()
            return Response(
                {"success": True, "message": "Code valide."},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"success": False, "message": "Code invalide ou expiré."},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Code_Verification.DoesNotExist:
        return Response(
            {"success": False, "message": "Code inexistant."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        # Log des erreurs serveur
        print(f"Erreur serveur : {e}")
        return Response(
            {"success": False, "error": "Erreur interne du serveur."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def add_chauffeur(request):
    item = ChauffeurSerializer(data=request.data)
    if item.is_valid():
        # Récupérer l'image de la requête
        image_file = request.FILES.get('photo')
        if not image_file:
            return Response({"error": "Aucune image envoyée"}, status=400)

        # Sauvegarder temporairement l'image
        filename = str(uuid.uuid4())
        temp_file_path = os.path.join(settings.MEDIA_ROOT, filename)
        with open(temp_file_path, 'wb') as temp_file:
            for chunk in image_file.chunks():
                temp_file.write(chunk)
        # Générer l'embedding à partir de l'image
        embedding = generate_emb(temp_file_path)
        os.remove(temp_file_path)  # Supprimer l'image temporaire après traitement
        if embedding is None:
            return Response({"error": "Impossible d'extraire un visage de l'image"}, status=400)
        # Ajouter le chauffeur et son embedding
        chauffeur = item.save()
        chauffeur.embedding = embedding.tobytes()  # Convertir l'embedding en format binaire
        chauffeur.save()
        return Response(ChauffeurSerializer(chauffeur).data, status=201)
    return Response(item.errors, status=400)
    
@api_view(['POST'])
def add_Point_recette(request):
    item = PointRecetteSerializer(data=request.data) 
    if item.is_valid():
        validated_data = item.validated_data
        if Point_Recette.objects.filter(**validated_data).exists():
            raise serializers.ValidationError('point déjà fait')
        item.save()
        return Response(item.data, status=status.HTTP_201_CREATED)
    else:
        return Response(item.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
# def verification_chauffeur(request):
#     # Vérifiez si une image est envoyée
#     # image_b64 = request.POST.get('imageBase64')
#     # if not image_b64:
#     #     return Response({'error': 'Aucune image fournie'}, status=status.HTTP_400_BAD_REQUEST)
    
#     # filename = f"{uuid.uuid4()}.jpg"  
#     # file_path = os.path.join(settings.MEDIA_ROOT, filename)
    
#     # try:
#     #     # Décoder et enregistrer l'image
#     #     imgstr = image_b64.split(',')[1]
#     #     with open(file_path, 'wb') as output:
#     #         output.write(base64.b64decode(imgstr))

#     #     # Comparer avec les embeddings
#     #     score, idx = face_app.get_similarity(file_path, utils.EmbeddingsDataset().embeddings)
#     #     os.remove(file_path)  # Supprimez le fichier temporaire
        
#     #     if score is not None:
#     #         # Trouver le chauffeur correspondant
#     #         chauffeur = Chauffeurs.objects.get(id=utils.EmbeddingsDataset().user_ids[idx])
#     #         if chauffeur:
#     #             data = {
#     #                 'id': chauffeur.id,
#     #                 'nom': chauffeur.nom,
#     #                 'prenom': chauffeur.prenom,
#     #                 'score': round(score * 100, 2)  # Score en pourcentage
#     #             }
#     #             return Response(data, status=status.HTTP_200_OK)
        
#     #     return Response({'error': 'Aucun chauffeur correspondant trouvé'}, status=status.HTTP_404_NOT_FOUND)
#     # except Exception as e:
#     #     return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#     filename = str(uuid.uuid4())  # Génère un nom unique pour le fichier temporaire
#     file_path = os.path.join(settings.MEDIA_ROOT, filename)
#     image_b64 = request.POST.get('imageBase64')  # Récupérer l'image envoyée en base64
#     if not image_b64:
#         return Response({"error": "Aucune image envoyée"}, status=400)

#     imgstr = image_b64.split(',')[1]  # Extraire les données après "data:image/jpeg;base64,"
#     with open(file_path, 'wb') as output:
#         output.write(base64.b64decode(imgstr))

#     # Étape 2 : Générer l'embedding pour l'image envoyée
#     embedding = generate_emb(file_path)  # Convertir l'image en embedding
#     os.remove(file_path)  # Supprimer le fichier temporaire après usage

#     if embedding is None:
#         return Response({"error": "Impossible d'extraire un visage de l'image"}, status=400)

#     # Étape 3 : Charger les embeddings des chauffeurs
#     dataset = EmbeddingsDataset()

#     score, idx = get_similarity(embedding, dataset.embeddings)

#     if score is not None and score >= 0.9:  # Seuil de similarité : 90 %
#         chauffeur_id = dataset.chauffeur_ids[idx]
#         chauffeur = Chauffeurs.objects.get(id=chauffeur_id)
#         return Response({
#             "id": chauffeur.id,
#             "nom": chauffeur.nom,
#             "prenom": chauffeur.prenom,
#             "score": round(score * 100, 2)  
#         })

#     return Response({"error": "Aucune correspondance trouvée"}, status=404)

def verification_chauffeur(request):
    # Vérifiez si une image est envoyée
    if 'image' not in request.FILES:
        return Response({'error': 'Aucune image fournie'}, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']  # Récupérer l'image du fichier envoyé
    filename = f"{uuid.uuid4()}.jpg"  # Générer un nom de fichier unique
    file_path = os.path.join(settings.MEDIA_ROOT, filename)

    try:
        # Enregistrer l'image temporairement
        with open(file_path, 'wb') as f:
            for chunk in image_file.chunks():
                f.write(chunk)

        # Étape 2 : Générer l'embedding pour l'image envoyée
        embedding = generate_emb(file_path)
        os.remove(file_path)  # Supprimer le fichier temporaire

        if embedding is None:
            return Response({"error": "Impossible d'extraire un visage de l'image"}, status=400)

        # Étape 3 : Charger les embeddings des chauffeurs
        dataset = EmbeddingsDataset()  # Assurez-vous que cette classe charge correctement les embeddings
        if not dataset.embeddings:
            return Response({"error": "Le dataset des chauffeurs est vide"}, status=500)

        # Comparer l'embedding généré avec les embeddings du dataset
        score, idx = get_similarity(embedding, dataset.embeddings)

        if score is not None and score >= 0.9:  # Seuil de similarité : 90 %
            try:
                chauffeur_id = dataset.chauffeur_ids[idx]
                chauffeur = Chauffeurs.objects.get(id=chauffeur_id)
                return Response({
                    "id": chauffeur.id,
                    "nom": chauffeur.nom,
                    "prenom": chauffeur.prenom,
                    "score": round(score * 100, 2)
                })
            except Chauffeurs.DoesNotExist:
                return Response({"error": "Chauffeur non trouvé dans la base de données"}, status=404)

        return Response({"error": "Aucune correspondance trouvée"}, status=404)

    except Exception as e:
        return Response({'error': f"Erreur interne : {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



## add login

@api_view(['POST'])
def api_login(request):
    serialiser = AuthTokenSerializer(data=request.data)
    serialiser.is_valid(raise_exception=True)
    user = serialiser.validated_data['user']
    if user is not None:
        # On connecte l'utilisateur
        login(request._request, user)
        # return Response({"message": "Connexion réussie"}, status=status.HTTP_200_OK)
        # token = AuthToken.objects.create(user)[1]
        token = AccessToken.for_user(user)
        return Response({
        "info_user": {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_superuser': user.is_superuser},
        "token": str(token)},status=status.HTTP_200_OK)
    return Response({"error": "Nom d'utilisateur ou mot de passe incorrect"}, status=status.HTTP_400_BAD_REQUEST)

## ADD logout
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    try:
        request.user.auth_token.delete()
    except (AttributeError):
        pass

    logout(request)
    return Response({"success": ("Successfully logged out.")},status=status.HTTP_200_OK)
