import { useState, useEffect } from "react";
import { DataTable } from "@/components/DataTable";
import { CodeGenerator } from "@/components/CodeGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { fetchUsers, fetchRecipes, updateUser, deleteUser, updateRecipe, deleteRecipe } from "@/api/api";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";


const chauffeurColumns = [
  { header: "Nom", accessor: "nom" },
  { header: "Prénom", accessor: "prenom" },
  { header: "Date de naissance", accessor: "date_naissance" },
  { header: "Sexe", accessor: "sexe" },
  { header: "Numero CNI", accessor: "numero_CNI" },
  { header: "Numero de téléphone", accessor: "numero_tel" },
  { header: "Lieu de naissance", accessor: "lieu_naissance" },
  { header: "Situation matrimoniale", accessor: "situation_matrimoniale" },
  { header: "Lieu d'habitation", accessor: "lieu_habitation" },
  { header: "Niveau d'étude", accessor: "niveau_etude" },
  { header: "Expérience Pro", accessor: "experience_pro" },
  { header: "Personne en cas d'urgence", accessor: "personne_en_cas_urgence" },
  { header: "Numero en cas d'urgence", accessor: "num_en_cas_urgence" },
  { header: "Employeur précédant", accessor: "employeur_precedant" },
];

const recetteColumns = [
  { header: "Date", accessor: "date_de_point" },
  { header: "Recette", accessor: "Recette" },
  { header: "Nom chauffeur", accessor: "chauffeur_nom" },
  { header: "Prenom chauffeur", accessor: "chauffeur_prenom" },
  { header: "Immatriculation", accessor: "immatriculation_auto" },
  { header: "Kilométrage", accessor: "km" },
];

const ListeChauffeurRecette = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

  // Chargement initial des données
  useEffect(() => {
    const loadChauffeur = async () => {
      try {
        const response = await fetch('https://vtc-bjny.onrender.com/all-chauffeur/');
        //  
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }

      } catch (error) {
        toast.error('Erreur lors du chargement des utilisateurs');
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    const loadRecette = async () => {
      try {
        const response = await fetch('https://vtc-bjny.onrender.com/all-recette/');
        if (response.ok) {
          const data = await response.json();
          setRecipes(data);
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des recettes');
        console.error('Erreur lors de la récupération des recettes:', error);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    loadChauffeur();
    loadRecette();
  }, []);

  // Handlers pour les utilisateurs
  const handleUpdateUser = async (id: string, data: any) => {
    try {
      const response = await fetch(`https://vtc-bjny.onrender.com/update-chauffeur/${id}/`, {
        method: 'PUT',

        // body: JSON.stringify(data),
        body: data,
      });
      if (response.ok) {
        await response.json();
        const new_response = await fetch('https://vtc-bjny.onrender.com/all-chauffeur/');
        const updatedChauffeur = await new_response.json();
        setUsers(updatedChauffeur);
        toast.success('Chauffeur mis à jour avec succès');
      }

    } catch (error) {
      toast.error('Erreur lors de la mise à jour du chauffeur');
      console.error('Erreur:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await fetch(`https://vtc-bjny.onrender.com/delete-chauffeur/${id}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await response.json();
        const new_response = await fetch('https://vtc-bjny.onrender.com/all-chauffeur/');
        const updatedChauffeur = await new_response.json();
        setUsers(updatedChauffeur);
        toast.success('Chauffeur supprimé avec succès');
      }

    } catch (error) {
      toast.error('Erreur lors de la suppression du chauffeur');
      console.error('Erreur:', error);
    }
  };
  // Handlers pour les recettes
  const handleUpdateRecipe = async (id: string, data: any) => {
    try {
      const response = await fetch(`https://vtc-bjny.onrender.com/update-recette/${id}/`, {
        method: 'PUT',

        // body: JSON.stringify(data),
        body: data,
      });
      if (response.ok) {
        await response.json();
        const new_response = await fetch('https://vtc-bjny.onrender.com/all-recette/');
        const updatedRecette = await new_response.json();
        setRecipes(updatedRecette);
        toast.success('Recette mise à jour avec succès');
      }

    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la recette');
      console.error('Erreur:', error);
    }
  };
  // const handleDeleteRecipe = async (d: string) => {}
  const handleDeleteRecipe = async (id: string) => {
    try {
      const response = await fetch(`https://vtc-bjny.onrender.com/delete-recette/${id}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await response.json();
        const new_response = await fetch('https://vtc-bjny.onrender.com/all-recette/');
        const updatedRecette = await new_response.json();
        setRecipes(updatedRecette);
        toast.success('Recette supprimée avec succès');
      }

    } catch (error) {
      toast.error('Erreur lors de la suppression de la recette');
      console.error('Erreur:', error);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="container mx-auto py-8 space-y-8">
        {/* <h1 className="text-4xl font-bold mb-8">Panneau d'Administration</h1> */}
        <Tabs defaultValue="chauffeur" className="w-full">
          <h1 className="text-2xl font-bold mb-3">Liste des chauffeurs et des recettes</h1>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="chauffeur">Chauffeurs</TabsTrigger>
            <TabsTrigger value="recette">Recettes</TabsTrigger>
          </TabsList>
          <TabsContent value="chauffeur" className="animate-fade-in">
            {isLoadingUsers ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <DataTable
                data={users}
                columns={chauffeurColumns}
                onUpdate={handleUpdateUser}
                onDelete={handleDeleteUser}
                type="chauffeur"
              />
            )}
          </TabsContent>
          <TabsContent value="recette" className="animate-fade-in">
            {isLoadingRecipes ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <DataTable
                data={recipes}
                columns={recetteColumns}
                onUpdate={handleUpdateRecipe}
                onDelete={handleDeleteRecipe}
                type="recette"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default ListeChauffeurRecette;