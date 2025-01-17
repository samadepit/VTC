import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const GuestRoute = () => {
  // Vérifier si l'utilisateur est authentifié
  const token = Cookies.get("token");

  // Si le token existe, empêcher l'accès en redirigeant vers une autre route
  return token ? <Navigate to="/dashboard" /> : <Outlet />;
};

export default GuestRoute;
