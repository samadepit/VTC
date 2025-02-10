import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Webcam from "react-webcam";
import { isMobile } from 'react-device-detect';
import Cookies from 'js-cookie';



export const RegistrationForm = () => {

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [date_naissance, setDate_naissance] = useState("");
  const [sexe, setSexe] = useState("");
  const [photoName, setPhotoName] = useState("")
  const [url, setUrl] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const navigate = useNavigate();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
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
    setUrl(capturedImage);
    setPhoto(imageFile);
    setPhotoName(imageFile.name)
    setIsCameraOpen(false);
  };

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
      Cookies.remove('token');
      const token = Cookies.get("token");

      if (!token) {
        navigate("/login");
        toast.success("Compte créer avec success ! veuillez vous reconnecter encore SVP !");
      }
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

  console.log(nom, prenom, date_naissance, sexe, photo)
  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div>
        {isMobile ? (
          <p>Vous êtes sur un appareil mobile.</p>
        ) : (
          <p>Vous êtes sur un ordinateur.</p>
        )}
      </div>
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
      {isMobile ? (
        <>
          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => setPhoto(e.target.files?.[0])}
              className="form-input"
              required
            />
          </div>
        </>
      ) : (
        <>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-0">
            Photo
          </label>
          <div className="form-input flex items-center border rounded-lg p-1 space-x-2">
            <button
              type="button"
              className="px-2 py-1 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 cursor-pointer"
              onClick={() => setIsCameraOpen(true)}
            >
              Prendre une photo
            </button>
            {photo ? (
              <>
                <img src={url} alt="Photo" className="w-9 h-9 object-cover rounded" />
                <span className="text-sm text-gray-600">{photoName}</span>
              </>
            ) : (
              <span className="text-gray-500">Aucune photo ...</span>
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
                    onClick={capturePhoto}
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
      <button type="submit" className="btn-primary w-full">
        S'inscrire
      </button>
    </form>
  );
};