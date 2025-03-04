import React from 'react';
import { useState } from "react";
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';


const ProtectedRouteAdmin =  () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Vérification de l'authentification via un cookie ou un autre mécanisme
  const token_admin = Cookies.get("token_admin");

  return token_admin ? <Outlet /> : <Navigate to="/login/admin" />;
};

export default ProtectedRouteAdmin;
