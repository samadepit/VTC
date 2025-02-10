import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import Webcam from "react-webcam";
import { isMobile } from 'react-device-detect';





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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const webcamRef = useRef(null);

  // Convertir Base64 en fichier avant de l'envoyer à `setPhoto`
  const base64ToFile = (base64String, fileName) => {
    const base64Data = base64String.split(",")[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });
    return new File([blob], fileName, { type: "image/png" });
  };

  const capturePhoto = () => {
    const capturedImage = webcamRef.current.getScreenshot(); // Capture l'image de la webcam
    const imageFile = base64ToFile(capturedImage, "image.png");
    setImageUrl(capturedImage);
    setPhoto(imageFile);
    // setPhotoName(imageFile.name)
    setIsCameraOpen(false);
  };


  const handleImageUpload = async () => {
    const capturedImage = webcamRef.current.getScreenshot();
    const file = base64ToFile(capturedImage, "image.png");
    console.log(file)

    try {
      setIsUploading(true);

      // Créez un FormData pour envoyer le fichier à l'API
      const formData1 = new FormData();
      formData1.append("image", file);

      // Appeler l'API pour vérifier l'image
      const response = await fetch("http://127.0.0.1:8000/verification-chauffeur/", {
        method: "POST",
        body: formData1,
      });

      const result = await response.json();

      if (response.ok) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
          setIsImageVerified(true);
          setUserData(result);
          toast.success("Image vérifiée avec succès !");
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(
          result.message || "L'image n'a pas pu être vérifiée. Veuillez réessayer."
        );
        setIsImageVerified(false);
        setImageUrl(null)
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la vérification de l'image. Veuillez réessayer.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUploadMobile = async (e) => {
    const file = e.target.files?.[0]

    try {
      setIsUploading(true);

      // Créez un FormData pour envoyer le fichier à l'API
      const formData1 = new FormData();
      formData1.append("image", file);

      // Appeler l'API pour vérifier l'image
      const response = await fetch("http://127.0.0.1:8000/verification-chauffeur/", {
        method: "POST",
        body: formData1,
      });

      const result = await response.json();

      if (response.ok) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
          setIsImageVerified(true);
          setUserData(result);
          toast.success("Image vérifiée avec succès !");
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(
          result.message || "L'image n'a pas pu être vérifiée. Veuillez réessayer."
        );
        setIsImageVerified(false);
        setImageUrl(null)
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
      const reponse = await fetch("http://127.0.0.1:8000/point-recette/", {
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
        Cookies.remove('token');
        const token = Cookies.get("token");

        if (!token) {
          navigate("/login");
          toast.success("Recette soumise avec success. Veuillez vous reconnecter encore SVP !");
        }
      } else {
        toast.error(result.message || "Erreur lors de la validation de la recette");
      }
    } catch (error) {
      console.error('Erreur de soumission de la recette:', error);
      toast.error("Erreur de soumission");
    }
  };

  // console.log(userData)
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };
  console.log(photo)
  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      {isMobile ? (
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
                  capture="user"
                  className="hidden"
                  onChange={handleImageUploadMobile}
                  disabled={isUploading}
                />
              </label>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="w-full">
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
            <div
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              onClick={() => setIsCameraOpen(true)}
            >
              <p className="text-gray-600 text-lg">Cliquez pour uploader une photo</p>
            </div>
          )}
          </div>
          {isCameraOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  className="w-full rounded-lg"
                />
                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    // onChange={handleImageUpload}
                    onClick={() => {
                      capturePhoto(); // Appeler la fonction pour capturer la photo
                      handleImageUpload(); // Appeler la fonction pour gérer l'upload
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
                  >
                    Capturer
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
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
              value={userData.nom}
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
              value={userData.prenom}
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