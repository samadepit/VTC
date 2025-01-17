import { useLocation, useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 
          onClick={() => navigate("/")} 
          className="text-2xl font-bold text-primary cursor-pointer"
        >
          DjoulatchaiApp
        </h1>
        {/* <nav>
          {location.pathname !== "/login" && (
            <button
              onClick={() => navigate("/login")}
              className="btn-primary"
            >
              Connexion
            </button>
          )}
        </nav> */}
      </div>
    </header>
  );
};