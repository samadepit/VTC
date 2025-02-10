import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';


const ProtectedRouteAdmin = () => {
  // Vérification de l'authentification via un cookie ou un autre mécanisme
  const token_admin = Cookies.get("token_admin");

  return token_admin ? <Outlet /> : <Navigate to="/login/admin" />;
};

export default ProtectedRouteAdmin;
