import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";


export const ExpenseForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
    category: "",
    description: "",
  });
  const [recette, setRecette] = useState("");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageVerified, setIsImageVerified] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Créez un FormData pour envoyer le fichier à l'API
      const formData1 = new FormData();
      formData1.append("image", file);

      // Appeler l'API pour vérifier l'image
      const response = await fetch("https://votre-api-verification.com/verify", {
        method: "POST",
        body: formData1,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
          setIsImageVerified(true);
          setUserData(result.user);
          toast.success("Image vérifiée avec succès !");
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(
          result.message || "L'image n'a pas pu être vérifiée. Veuillez réessayer."
        );
        setIsImageVerified(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la vérification de l'image. Veuillez réessayer.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reponse = await fetch("http://127.0.0.1:8000/verifier-code/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "chauffeur_id": userData.id,
          "Recette": recette,
        }),
      });
      const result = await reponse.json();


      if (reponse.ok) {
        toast.success("Recette soumis avec succès");
        setImageUrl(null);
        setIsImageVerified(false);
        navigate("/dashboard");
      } else {
        toast.error(result.message || "Erreur lors de la validation de la recette");
      }
    } catch (error) {
      console.error('Erreur de soumission de la recette:', error);
      toast.error("Erreur de soumission");
    }
  };


  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="flex flex-col items-center gap-4">
        {imageUrl ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="Reçu"
              className="w-full h-full object-cover"
            />
            {!isImageVerified && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  Vérification en cours...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full">
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">
                  {isUploading
                    ? "Chargement..."
                    : "Cliquez pour uploader une photo"}
                </p>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        )}
      </div>


      <div>
        <label htmlFor="recette" className="block text-sm font-medium text-gray-700 mb-2">
          Montant
        </label>
        <input
          id="recette"
          name="recette"
          type="number"
          step="0.10"
          value={recette}
          onChange={(e) => setRecette(e.target.value)}
          className="form-input"
          placeholder="0.00"
        />
      </div>
      {isImageVerified && userData && (
        <>
        <div>
        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          value={formData.category}
          // onChange={handleChange}
          className="form-input"
          placeholder="Votre nom"
          readOnly
        />
      </div>
      <div>
        <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
          Prenom
        </label>
        <input
          id="prenom"
          name="prenom"
          type="text"
          value={formData.category}
          // onChange={handleChange}
          className="form-input"
          placeholder="Votre prenom"
          readOnly
        />
      </div>
        </>
      )}
      <button type="submit" className="btn-primary w-full">
        Enregistrer la recette
      </button>
    </form>
  );
};