import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Webcam from "react-webcam";
import { isMobile } from 'react-device-detect';
import Cookies from 'js-cookie';
import * as faceapi from "face-api.js";




export const RegistrationForm = () => {

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [date_naissance, setDate_naissance] = useState("");
  const [sexe, setSexe] = useState("");
  const [lieuNaissance, setLieuNaissance] = useState("");
  const [situaMatri, setSituaMatri] = useState("");
  const [numCni, setNumCni] = useState("");
  const [numTel, setNumTel] = useState("");
  const [lieuHabitat, setLieuHabitat] = useState("");
  const [niveauEtud, setNiveauEtud] = useState("");
  const [expPro, setExpPro] = useState("");
  const [prsneCasUrgent, setPrsneCasUrgent] = useState("");
  const [numCasUrgent, setNumCasUrgent] = useState("");
  const [employeurPrec, setEmployeurPrec] = useState("");
  const [photoName, setPhotoName] = useState("")
  const [url, setUrl] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isButtonloading, setIsButtonloading] = useState(false)
  const [lastBox, setLastBox] = useState(null); // Pour lisser les coordonnées
  const [isFaceInCircle, setIsFaceInCircle] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user"); // "user" = avant, "environment" = arrière
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();


  const toggleCamera = () => {
    setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);
        console.log("Modèles chargés avec succès !");
        setIsCameraReady(true);
      } catch (error) {
        console.error("Erreur lors du chargement des modèles :", error);
        toast.error("Erreur de chargement des modèles de détection de visage.");
      }
    };
    loadModels();
  }, []);

  const smoothBox = (newBox, prevBox, factor = 0.7) => {
    if (!prevBox) return newBox;
    return {
      x: prevBox.x * factor + newBox.x * (1 - factor),
      y: prevBox.y * factor + newBox.y * (1 - factor),
      width: prevBox.width * factor + newBox.width * (1 - factor),
      height: prevBox.height * factor + newBox.height * (1 - factor),
    };
  };

  const detectFace = async () => {
    if (
      !webcamRef.current ||
      !canvasRef.current ||
      webcamRef.current.video.readyState !== 4
    ) {
      setFaceDetected(false);
      setIsFaceInCircle(false);
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner le cercle fixe au centre
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    try {
      const detections = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks();

      if (detections && detections.detection && detections.detection.box) {
        const { x, y, width, height } = detections.detection.box;
        if (x !== null && y !== null && width !== null && height !== null) {
          setFaceDetected(true);
          const smoothedBox = smoothBox({ x, y, width, height }, lastBox);
          setLastBox(smoothedBox);

          // Calculer le centre du visage
          const faceCenterX = smoothedBox.x + smoothedBox.width / 2;
          const faceCenterY = smoothedBox.y + smoothedBox.height / 2;

          // Vérifier si le visage est dans le cercle
          const distance = Math.sqrt(
            Math.pow(faceCenterX - centerX, 2) +
            Math.pow(faceCenterY - centerY, 2)
          );

          const isInside = distance < radius &&
            smoothedBox.width < radius * 2 &&
            smoothedBox.height < radius * 2;
          setIsFaceInCircle(isInside);

          // Mise à jour de la couleur du cercle selon la position
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.strokeStyle = isInside ? "limegreen" : "white";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          setFaceDetected(false);
          setIsFaceInCircle(false);
          setLastBox(null);
        }
      } else {
        setFaceDetected(false);
        setIsFaceInCircle(false);
        setLastBox(null);
        ctx.font = "20px Arial";
        ctx.fillStyle = "yellow";
        ctx.textAlign = "center";
        ctx.fillText(
          "Veuillez centrer votre visage dans le cercle",
          canvas.width / 2,
          canvas.height / 2
        );
      }
    } catch (error) {
      console.error("Erreur dans detectFace:", error);
      setFaceDetected(false);
      setIsFaceInCircle(false);
      setLastBox(null);
    }
  };

  useEffect(() => {
    let intervalId;
    if (isCameraOpen && isCameraReady) {
      intervalId = setInterval(detectFace, 200); // Réduit à 5 fois par seconde pour la performance
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isCameraOpen, isCameraReady]);

  const captureFace = async () => {
    if (!webcamRef.current || !canvasRef.current || !faceDetected || !isFaceInCircle) {
      toast.error("Veuillez positionner votre visage dans le cercle.");
      return;
    }

    const video = webcamRef.current.video;
    try {
      const detections = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks();

      if (detections && detections.detection && detections.detection.box) {
        const { x, y, width, height } = detections.detection.box;
        if (x !== null && y !== null && width !== null && height !== null) {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext("2d");
          tempCtx.drawImage(video, x, y, width, height, 0, 0, width, height);

          // Effet visuel avant capture
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await new Promise((resolve) => setTimeout(resolve, 200)); // Flash vert rapide

          tempCanvas.toBlob((blob) => {
            const file = new File([blob], "face.png", { type: "image/png" });
            setPhoto(file);
            setUrl(URL.createObjectURL(file));
            setPhotoName(file.name)
            // handleImageUpload(file);
            setIsCameraOpen(false);
          }, "image/png");
        } else {
          toast.error("Coordonnées invalides pour la capture.");
        }
      } else {
        toast.error("Aucun visage détecté pour la capture.");
      }
    } catch (error) {
      console.error("Erreur dans captureFace:", error);
      toast.error("Erreur lors de la capture du visage.");
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    setIsButtonloading(true)
    e.preventDefault();
    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prenom", prenom);
    formData.append("date_naissance", date_naissance);
    formData.append("sexe", sexe);
    formData.append("photo", photo);
    formData.append("lieu_naissance", lieuNaissance);
    formData.append("situation_matrimoniale", situaMatri);
    formData.append("numero_CNI", numCni);
    formData.append("lieu_habitation", lieuHabitat);
    formData.append("numero_tel", numTel);
    formData.append("niveau_etude", niveauEtud);
    formData.append("experience_pro", expPro);
    formData.append("personne_en_cas_urgence", prsneCasUrgent);
    formData.append("num_en_cas_urgence", numCasUrgent);
    formData.append("employeur_precedant", employeurPrec);

    const data = await fetch("http://127.0.0.1:8000/chauffeurs/", {
      method: "POST",
      // headers: { "Content-Type": "multipart/form-data" },
      body: formData,
    });
    const user = await data.json();
    if (data.ok) {
      toast.success("Votre compte a été créé avec succès");
      navigate("/dashboard");
      Cookies.remove('token');
      const token = Cookies.get("token");

      if (!token) {
        navigate("/login");
        toast.success("Compte créer avec success ! veuillez vous reconnecter encore SVP !");
      }
    } else if (data.status == 500) {
      toast.error(user.error || "Aucune image envoyée");
      setIsButtonloading(false)
    } else {
      toast.error(user.message || "impossible de creer son compte");
      setIsButtonloading(false)
    }
  };

  // console.log(nom, prenom, date_naissance, sexe, photo)
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
        <label htmlFor="lieuNaissance" className="block text-sm font-medium text-gray-700 mb-2">
          Lieu de naissance
        </label>
        <input
          id="lieuNaissance"
          name="lieuNaissance"
          type="text"
          value={lieuNaissance}
          onChange={(e) => setLieuNaissance(e.target.value)}
          className="form-input"
          placeholder="Votre lieu de naissance"
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
        <label htmlFor="situaMatri" className="block text-sm font-medium text-gray-700 mb-2">
          Situation matrimoniale
        </label>
        <input
          id="situaMatri"
          name="situaMatri"
          type="text"
          value={situaMatri}
          onChange={(e) => setSituaMatri(e.target.value)}
          className="form-input"
          placeholder="Votre situation matrimoniale"
          required
        />
      </div>
      <div>
        <label htmlFor="numCni" className="block text-sm font-medium text-gray-700 mb-2">
          Numero CNI
        </label>
        <input
          id="numCni"
          name="numCni"
          type="text"
          value={numCni}
          onChange={(e) => setNumCni(e.target.value)}
          className="form-input"
          placeholder="Votre numero CNI"
          required
        />
      </div>
      <div>
        <label htmlFor="numTel" className="block text-sm font-medium text-gray-700 mb-2">
          Numero de téléphone
        </label>
        <input
          id="numTel"
          name="numTel"
          type="number"
          value={numTel}
          onChange={(e) => setNumTel(e.target.value)}
          className="form-input"
          placeholder="Votre numero de téléphone"
          required
        />
      </div>
      <div>
        <label htmlFor="lieuHabitat" className="block text-sm font-medium text-gray-700 mb-2">
          Lieu d'habitation
        </label>
        <input
          id="lieuHabitat"
          name="lieuHabitat"
          type="text"
          value={lieuHabitat}
          onChange={(e) => setLieuHabitat(e.target.value)}
          className="form-input"
          placeholder="Votre lieu d'habitation"
          required
        />
      </div>
      <div>
        <label htmlFor="niveauEtud" className="block text-sm font-medium text-gray-700 mb-2">
          Niveau d'étude
        </label>
        <input
          id="niveauEtud"
          name="niveauEtud"
          type="text"
          value={niveauEtud}
          onChange={(e) => setNiveauEtud(e.target.value)}
          className="form-input"
          placeholder="Votre niveau d'étude"
        />
      </div>
      <div>
        <label htmlFor="expPro" className="block text-sm font-medium text-gray-700 mb-2">
          Expérience professionnelle
        </label>
        <input
          id="expPro"
          name="expPro"
          type="text"
          value={expPro}
          onChange={(e) => setExpPro(e.target.value)}
          className="form-input"
          placeholder="Votre expérience professionnelle"
        />
      </div>
      <div>
        <label htmlFor="prsneCasUrgent" className="block text-sm font-medium text-gray-700 mb-2">
          Personne a contacté en cas d'urgence
        </label>
        <input
          id="prsneCasUrgent"
          name="prsneCasUrgent"
          type="text"
          value={prsneCasUrgent}
          onChange={(e) => setPrsneCasUrgent(e.target.value)}
          className="form-input"
          placeholder="Personne a contacté en cas d'urgence"
          required
        />
      </div>
      <div>
        <label htmlFor="numCasUrgent" className="block text-sm font-medium text-gray-700 mb-2">
          Numero en cas d'urgence
        </label>
        <input
          id="numCasUrgent"
          name="numCasUrgent"
          type="text"
          value={numCasUrgent}
          onChange={(e) => setNumCasUrgent(e.target.value)}
          className="form-input"
          placeholder="Numero en cas d'urgence"
          required
        />
      </div>
      <div>
        <label htmlFor="employeurPrec" className="block text-sm font-medium text-gray-700 mb-2">
          Employeur Precédent
        </label>
        <input
          id="employeurPrec"
          name="employeurPrec"
          type="text"
          value={employeurPrec}
          onChange={(e) => setEmployeurPrec(e.target.value)}
          className="form-input"
          placeholder="Employeur Precédent"
        />
      </div>
      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
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
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  mirrored={facingMode === "user"} // Miroir uniquement pour la caméra avant
                  screenshotFormat="image/png"
                  className="w-full rounded-lg"
                  videoConstraints={{
                    facingMode: facingMode // Utilise le state pour choisir la caméra
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 10 }}
                />
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  onClick={captureFace}
                  disabled={!isFaceInCircle}
                  className={`px-4 py-2 rounded ${isFaceInCircle
                    ? "bg-green-500 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                    } text-white`}
                >
                  Capturer
                </button>
                {isMobile && (
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
                  >
                    {facingMode === "user" ? "Caméra arrière" : "Caméra avant"}
                  </button>
                )}
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
      </div>
      {!isButtonloading ? (
        <button
          type="submit"
          className="btn-primary w-full"
        >
          S'inscrire
        </button>
      ) : (
        <div className="flex justify-center p-1 rounded-lg btn-primary">
          <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
      )}
    </form>
  );
};