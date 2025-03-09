import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useToast } from "@/components/ui/use-toast";
import { v4 as uuid } from "uuid";
import Cookies from 'js-cookie';
import { toast } from "sonner";


export const LoginForm = () => {

  const [code, setCode] = useState("");
  const [isButtonloading, setIsButtonloading] = useState(false)
  const navigate = useNavigate();
  // const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    setIsButtonloading(true)
    e.preventDefault();
    const reponse = await fetch("https://vtc-bjny.onrender.com/verifier-code/", {
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
      toast.success("Connexion réussie");
      navigate("/dashboard");
      Cookies.set('token', unique_id, { expires: 1 / 144 });
    } else {
      toast.error(data.message || "Code invalide");
      setIsButtonloading(false)
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
      {!isButtonloading ? (
        <button
          type="submit"
          className="btn-primary w-full"
          >
          Se connecter
        </button>
      ) : (
        <div className="flex justify-center p-1 rounded-lg btn-primary">
          <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
      )}
    </form>
  );
};