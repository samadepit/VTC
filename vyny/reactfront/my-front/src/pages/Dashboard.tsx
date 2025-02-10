import { Button } from "@/components/ui/button";
import { PlusCircle, UserCircle } from "lucide-react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { DriverRecipes } from "@/components/DriverRecipes";
import React, { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Dashboard = () => {
  // Données temporaires pour la démonstration
  const navigate = useNavigate();
  const mockRecipes = [
    {
      id: "1",
      date: "2024-03-20",
      amount: 150.5,
      description: "Course Paris-Lyon",
      type: "income" as const,
    },
    {
      id: "2",
      date: "2024-03-21",
      amount: 45.30,
      description: "Essence",
      type: "expense" as const,
    },
  ];


  return (
    <div className="min-h-[calc(100vh-64px)] p-4 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Gérez vos recettes et informations personnelles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-24 text-lg w-full">
                <PlusCircle className="mr-2 h-6 w-6" />
                Faire une recette
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle Recette</DialogTitle>
              </DialogHeader>
              <ExpenseForm />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-24 text-lg w-full" onClick={() => navigate("/register")}>
                <UserCircle className="mr-2 h-6 w-6" />
                Ajouter mes informations
              </Button>
            </DialogTrigger>

          </Dialog>
        </div>

        {/* <div className="bg-white rounded-lg shadow">
          <DriverRecipes driverId="temp-id" recipes={mockRecipes} />
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;