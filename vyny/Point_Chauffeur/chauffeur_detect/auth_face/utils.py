from ..models import Chauffeurs
import numpy as np

class EmbeddingsDataset():

    def __init__(self):
        self.chauffeur_ids = []  # Liste des IDs des chauffeurs
        self.embeddings = []     # Liste des embeddings des chauffeurs

        # Charger tous les chauffeurs ayant un embedding valide
        profiles = Chauffeurs.objects.all()
        for p in profiles:
            if p.embedding is not None:  # Vérifie si l'embedding existe
                e = np.frombuffer(p.embedding, dtype=np.float32)  # Convertir les données binaires en tableau numpy
                self.chauffeur_ids.append(p.id)  # Ajoute l'ID du chauffeur
                self.embeddings.append(e)  # Ajoute l'embedding