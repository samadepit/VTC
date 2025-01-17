import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';


const ProtectedRoute = () => {
  // Vérification de l'authentification via un cookie ou un autre mécanisme
  const token = Cookies.get("token");

  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
