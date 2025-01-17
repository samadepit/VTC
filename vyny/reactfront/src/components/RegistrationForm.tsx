import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


export const RegistrationForm = () => {

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [date_naissance, setDate_naissance] = useState("");
  const [sexe, setSexe] = useState("");
  const [photo, setPhoto] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prenom", prenom);
    formData.append("date_naissance", date_naissance);
    formData.append("sexe", sexe);
    formData.append("photo", photo);

    const data = await fetch("http://127.0.0.1:8000/chauffeurs/", {
      method: "POST",
      // headers: { "Content-Type": "multipart/form-data" },
      body: formData,
    });
    const user = await data.json();
    console.log(data);
    
    if (data.ok) {
      // toast({
      //   title: "Inscription réussie",
      //   description: "Votre compte a été créé avec succès",
      // });
      toast.success("Votre compte a été créé avec succès");
      navigate("/dashboard");
    } else if (data.status == 500) {
      // toast({
      //   variant: "destructive",
      //   title: "Erreur",
      //   description: "Aucune image envoyée",
      // });
      toast.error(user.message || "Aucune image envoyée");
    } else {
      // toast({
      //   variant: "destructive",
      //   title: "Erreur",
      //   description: "impossible de creer son compte",
      // });
      toast.error(user.message || "impossible de creer son compte");
    }
  };

  console.log(nom,prenom,date_naissance,sexe,photo)
  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="form-input"
          placeholder="Votre nom"
          required
        />
      </div>
      <div>
        <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
          Prénom
        </label>
        <input
          id="prenom"
          name="prenom"
          type="text"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          className="form-input"
          placeholder="Votre prénom"
          required
        />
      </div>
      <div>
        <label htmlFor="date_naissance" className="block text-sm font-medium text-gray-700 mb-2">
          Date de naissance
        </label>
        <input
          id="date_naissance"
          name="date_naissance"
          type="date"
          value={date_naissance}
          onChange={(e) => setDate_naissance(e.target.value)}
          className="form-input"
          required
        />
      </div>
      <div>
        <label htmlFor="sexe" className="block text-sm font-medium text-gray-700 mb-2">
          Sexe
        </label>
        <select
          id="sexe"
          name="sexe"
          value={sexe}
          onChange={(e) => setSexe(e.target.value)}
          className="form-select"
          required
        >
          <option value="">Sélectionnez</option>
          <option value="H">Homme</option>
          <option value="F">Femme</option>
          <option value="A">Autre</option>
        </select>
      </div>
      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
          Photo
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0])}
          className="form-input"
          required
        />
      </div>
      <button type="submit" className="btn-primary w-full">
        S'inscrire
      </button>
    </form>
  );
};