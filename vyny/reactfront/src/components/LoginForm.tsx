import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useToast } from "@/components/ui/use-toast";
import { v4 as uuid } from "uuid";
import Cookies from 'js-cookie';
import { toast } from "sonner";


export const LoginForm = () => {

  const [code, setCode] = useState("");
  const navigate = useNavigate();
  // const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reponse = await fetch("http://127.0.0.1:8000/verifier-code/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "code": code,
      }),
    });
    const unique_id = uuid(); 
    const data = await reponse.json();
    if (reponse.ok) {
      // toast({
      //   title: "Connexion réussie",
      //   description: "Bienvenue sur votre espace chauffeur",
      // });
      toast.success("Connexion réussie");
      navigate("/dashboard");
      Cookies.set('token', unique_id, { expires: 1 / 144 }); 
    } else {
      // toast({
      //   variant: "destructive",
      //   title: "Erreur",
      //   description: "Code invalide ou expiré.",
      // });
      toast.error(data.message || "Code invalide");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
          Code unique
        </label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={4}
          className="form-input"
          placeholder="Entrez votre code à 4 caractères"
          required
        />
      </div>
      <button type="submit" className="btn-primary w-full">
        Se connecter
      </button>
      {/* <p className="text-center text-sm text-gray-600">
        Pas encore inscrit ?{" "}
        <span
          onClick={() => navigate("/register")}
          className="text-primary hover:text-primary-dark cursor-pointer"
        >
          Créer un compte
        </span>
      </p> */}
    </form>
  );
};