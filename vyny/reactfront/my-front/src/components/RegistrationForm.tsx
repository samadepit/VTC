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
  const [photoName, setPhotoName] = useState("")
  const [url, setUrl] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isButtonloading, setIsButtonloading] = useState(false)
  const [lastBox, setLastBox] = useState(null); // Pour lisser les coordonnées
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

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
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      const detections = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks();

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections && detections.detection && detections.detection.box) {
        const { x, y, width, height } = detections.detection.box;
        if (x !== null && y !== null && width !== null && height !== null) {
          setFaceDetected(true);
          const smoothedBox = smoothBox({ x, y, width, height }, lastBox);
          setLastBox(smoothedBox);
          // console.log("Smoothed Box:", smoothedBox);

          // Dessin amélioré du cercle
          ctx.beginPath();
          ctx.arc(
            smoothedBox.x + smoothedBox.width / 2,
            smoothedBox.y + smoothedBox.height / 2,
            smoothedBox.width / 2,
            0,
            2 * Math.PI
          );
          ctx.strokeStyle = "limegreen";
          ctx.lineWidth = 4;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "limegreen";
          ctx.stroke();
          ctx.shadowBlur = 0; // Réinitialiser l'ombre
        } else {
          setFaceDetected(false);
          setLastBox(null);
        }
      } else {
        setFaceDetected(false);
        setLastBox(null);
        // Message si aucun visage détecté
        ctx.font = "20px Arial";
        ctx.fillStyle = "yellow";
        ctx.textAlign = "center";
        ctx.fillText(
          "Veuillez centrer votre visage",
          canvas.width / 2,
          canvas.height / 2
        );
      }
    } catch (error) {
      console.error("Erreur dans detectFace:", error);
      setFaceDetected(false);
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
    if (!webcamRef.current || !canvasRef.current || !faceDetected) {
      toast.error("La caméra ou la détection n'est pas prête.");
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
      toast.error(user.message || "Aucune image envoyée");
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
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  mirrored={true}
                  screenshotFormat="image/png"
                  className="w-full rounded-lg"
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
                  disabled={!faceDetected}
                  className={`px-4 py-2 rounded ${faceDetected
                      ? "bg-green-500 hover:bg-green-700"
                      : "bg-gray-400"
                    } text-white`}
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
      {!isButtonloading ? (
        <button
          type="submit"
          className="btn-primary w-full"
          >
          S'inscire
        </button>
      ) : (
        <div className="flex justify-center p-1 rounded-lg btn-primary">
          <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
      )}
    </form>
  );
};