import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Cookies from 'js-cookie';
import { toast } from "sonner";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token_admin = Cookies.get("token_admin");

  const handleLogout = async (e) => {
    e.preventDefault();
    const reponse = await fetch("http://127.0.0.1:8000/logout/", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token_admin,
      },
    });
    const user = await reponse.json();
    //   console.log(token_admin)
    if (reponse.ok) {
      Cookies.remove("token_admin");
      toast.success("Deconnexion réussie");
      navigate("/login/admin");
    } else {
      // toast({
      //     variant: "destructive",
      //     title: "Erreur de connexion",
      //     description: "Email ou mot de passe incorrect",
      // });
      toast.error(user.message || "Impossible de se deconnecter");
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-primary cursor-pointer"
        >
          DjoulatchaiApp
        </h1>
        <nav>
          {location.pathname == "/admin" && (
            <Button variant="outline"
              onClick={handleLogout} 
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-blue-100 rounded shadow"
            >
              Déconnexion
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};