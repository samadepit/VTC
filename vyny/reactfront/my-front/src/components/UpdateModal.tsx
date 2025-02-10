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
      onUpdate(formData1);
    }else{
      formData1.append("Recette", formData.Recette)
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
    ]
    : [
      // { name: "date_de_point", label: "Date", type:"date" },
      { name: "Recette", label: "Recette", type: "number" },
      // { name: "chauffeur_nom", label: "Nom du chauffeur", type:"text" },
      // { name: "chauffeur_prenom", label: "Prénom du chauffeur", type:"text" },
    ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] animate-fade-in">
        <form onSubmit={handleSubmit}>
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