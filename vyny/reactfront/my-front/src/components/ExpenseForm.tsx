import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Webcam from "react-webcam";
import { isMobile } from "react-device-detect";
import * as faceapi from "face-api.js";
import Camera, { FACING_MODES, IMAGE_TYPES } from "react-html5-camera-photo";
import Popup from "../components/Popup";

export const ExpenseForm = () => {
  const navigate = useNavigate();
  const [recette, setRecette] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [km, setKm] = useState(null);
  const [matriculation, setMatriculation] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageVerified, setIsImageVerified] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isButtonloading, setIsButtonloading] = useState(false)
  const [lastBox, setLastBox] = useState(null); // Pour lisser les coordonnées
  const [isFaceInCircle, setIsFaceInCircle] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user"); // "user" = avant, "environment" = arrière
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);


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

  // Vérifier les permissions de la caméra
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("Accès à la caméra autorisé");
      } catch (error) {
        console.error("Erreur d'accès à la caméra:", error);
        toast.error(
          "Impossible d'accéder à la caméra. Vérifiez les permissions ou assurez-vous d'utiliser HTTPS."
        );
        setIsCameraOpen(false);
      }
    };

    if (isCameraOpen) {
      checkCameraPermission();
    }
  }, [isCameraOpen]);

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
            setImageUrl(URL.createObjectURL(file));
            handleImageUpload(file);
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


  const handleImageUpload = async (file) => {
    try {
      setIsUploading(true);
      const formData1 = new FormData();
      formData1.append("image", file);

      const response = await fetch("https://vtc-bjny.onrender.com/verification-chauffeur/", {
        method: "POST",
        body: formData1,
      });

      const result = await response.json();
      if (response.ok) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result);
          setIsImageVerified(true);
          setUserData(result);
          toast.success("Image vérifiée avec succès !");
          setIsPopupOpen(true);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(result.message || "L'image n'a pas pu être vérifiée.");
        setIsImageVerified(false);
        setImageUrl(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la vérification de l'image.");
      setIsImageVerified(false);
      setImageUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUploadMobile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData1 = new FormData();
      formData1.append("image", file);

      const response = await fetch("https://vtc-bjny.onrender.com/verification-chauffeur/", {
        method: "POST",
        body: formData1,
      });

      const result = await response.json();
      if (response.ok) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result);
          setIsImageVerified(true);
          setUserData(result);
          toast.success("Image vérifiée avec succès !");
          setIsPopupOpen(true);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(result.error || "L'image n'a pas pu être vérifiée.");
        setIsImageVerified(false);
        setImageUrl(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la vérification de l'image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    setIsButtonloading(true)
    e.preventDefault();
    try {
      const reponse = await fetch("https://vtc-bjny.onrender.com/point-recette/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chauffeur_id: userData?.id,
          Recette: recette,
          km: km,
          immatriculation_auto: matriculation,
        }),
      });
      const result = await reponse.json();

      if (reponse.ok) {
        toast.success("Recette soumise avec succès");
        setImageUrl(null);
        setIsImageVerified(false);
        navigate("/dashboard");
        Cookies.remove("token");
        const token = Cookies.get("token");

        if (!token) {
          navigate("/login");
          toast.success("Recette soumise avec succès. Veuillez vous reconnecter !");
        }
      } else {
        toast.error(result.message || "Erreur lors de la validation de la recette");
        setIsButtonloading(false)
      }
    } catch (error) {
      console.error("Erreur de soumission de la recette:", error);
      toast.error("Erreur de soumission");
    }
  };

  const handleClosePopup = () => {
    setIsImageVerified(false);
    setImageUrl(null);
    setUserData(null)
    setIsPopupOpen(false);
  };

  const handleConfirm = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      {isPopupOpen && (
        <Popup
          userData={userData}
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
          onConfirm={handleConfirm}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md max-h-[80vh] overflow-y-auto sm:max-h-none sm:overflow-y-visible">
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
              <p className="text-gray-600 text-lg">Cliquez pour capturer une photo</p>
            </div>
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
                    facingMode: facingMode 
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
        {isImageVerified && userData && (
          <>
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
            <div>
              <label htmlFor="km" className="block text-sm font-medium text-gray-700 mb-2">
                Kilométrage
              </label>
              <input
                id="km"
                name="km"
                type="text"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                className="form-input"
                placeholder="Entrez le kilométrage"
              />
            </div>
            <div>
              <label htmlFor="matriculation" className="block text-sm font-medium text-gray-700 mb-2">
                Immatriculation
              </label>
              <input
                id="matriculation"
                name="matriculation"
                type="text"
                value={matriculation}
                onChange={(e) => setMatriculation(e.target.value)}
                className="form-input"
                placeholder="Entrez l'immatriculation de la voiture"
              />
            </div>
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={userData.nom || ""}
                className="form-input text-gray-500 bg-gray-100"
                placeholder="Votre nom"
                disabled
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
                value={userData.prenom || ""}
                className="form-input text-gray-500 bg-gray-100"
                placeholder="Votre prénom"
                disabled
              />
            </div>
          </>
        )}
        {!isButtonloading ? (
          <button type="submit"
            className="btn-primary w-full"
            disabled={!isImageVerified}
          >
            Enregistrer la recette
          </button>
        ) : (
          <div className="flex justify-center p-1 rounded-lg btn-primary">
            <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
        )}

      </form>
    </>

  );
};