import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { toast } from "sonner";
export const AdminLoginForm = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // const { toast } = useToast();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const reponse = await fetch("http://127.0.0.1:8000/login/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              "username": username,
              "password": password,
            }),
          });
          const data = await reponse.json();
          const token_admin = data.token
        //   console.log(token_admin)
          Cookies.set('token_admin', token_admin);
        //   Cookies.set('token_admin', token_admin, { expires: 1 / 144 });
          if (reponse.ok) {
            // toast({
            //     title: "Connexion réussie",
            //     description: "Bienvenue dans votre espace administrateur",
            // });
            toast.success("Connexion réussie, Bienvenue dans votre espace administrateur");
            navigate("/admin");
        } else {
            // toast({
            //     variant: "destructive",
            //     title: "Erreur de connexion",
            //     description: "Email ou mot de passe incorrect",
            // });
            toast.error(data.message || "Email ou mot de passe incorrect");
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                </label>
                <input
                    type="text"
                    placeholder="Entrez votre username"
                    value={username}
                    className="form-input"
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                </label>
                <input
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    className="form-input"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="btn-primary w-full">
                Se connecter
            </button>
        </form>
    );
};