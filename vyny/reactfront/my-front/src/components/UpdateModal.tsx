import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: any) => void;
  data: any;
  type: "chauffeur" | "recette";
}

export const UpdateModal = ({
  isOpen,
  onClose,
  onUpdate,
  data,
  type,
}: UpdateModalProps) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData1 = new FormData()
    if (type == "chauffeur") {
      formData1.append("nom", formData.nom)
      formData1.append("prenom", formData.prenom)
      formData1.append("date_naissance", formData.date_naissance)
      formData1.append("lieu_naissance", formData.lieu_naissance)
      formData1.append("situation_matrimoniale", formData.situation_matrimoniale)
      formData1.append("numero_tel", formData.numero_tel)
      formData1.append("niveau_etude", formData.niveau_etude)
      formData1.append("experience_pro", formData.experience_pro)
      formData1.append("personne_en_cas_urgence", formData.personne_en_cas_urgence)
      formData1.append("num_en_cas_urgence", formData.num_en_cas_urgence)
      formData1.append("employeur_precedant", formData.employeur_precedant)
      onUpdate(formData1);
    }else{
      formData1.append("Recette", formData.Recette)
      formData1.append("immatriculation_auto", formData.immatriculation_auto)
      formData1.append("km", formData.km)
      onUpdate(formData1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const fields = type === "chauffeur"
    ? [
      { name: "nom", label: "Nom", type: "text" },
      { name: "prenom", label: "Prénom", type: "text" },
      { name: "date_naissance", label: "Date de naissance", type: "date" },
      { name: "lieu_naissance", label: "Lieu de naissance", type: "text" },
      { name: "situation_matrimoniale", label: "Situation matrimoniale", type: "text" },
      { name: "numero_tel", label: "Numero de téléphone", type: "text" },
      { name: "niveau_etude", label: "Lieu d'habitation", type: "text" },
      { name: "experience_pro", label: "Experience pro", type: "text" },
      { name: "personne_en_cas_urgence", label: "Personne en cas d'urgence", type: "text" },
      { name: "num_en_cas_urgence", label: "Numéro en cas d'urgence", type: "text" },
      { name: "employeur_precedant", label: "Employeur precedent", type: "text" },
     
    ]
    : [
      // { name: "date_de_point", label: "Date", type:"date" },
      { name: "Recette", label: "Recette", type: "number" },
      { name: "immatriculation_auto", label: "Immatriculation", type:"text" },
      { name: "km", label: "Kilométrage", type:"text" },
    ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md max-h-[80vh] overflow-y-auto sm:max-h-none sm:overflow-y-visible">
          <DialogHeader>
            <DialogTitle>
              Modifier {type === "chauffeur" ? "l'utilisateur" : "la recette"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {fields.map((field) => (
              <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field.name} className="text-right">
                  {field.label}
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer les modifications</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};