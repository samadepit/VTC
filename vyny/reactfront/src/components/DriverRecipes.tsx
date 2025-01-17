import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Type pour une recette
interface Recipe {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: "income" | "expense";
}

// Props du composant
interface DriverRecipesProps {
  driverId: string;
  recipes: Recipe[];
}

export const DriverRecipes = ({ driverId, recipes }: DriverRecipesProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mes Recettes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Liste de vos recettes et dépenses</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell>{formatDate(recipe.date)}</TableCell>
                <TableCell>{recipe.description}</TableCell>
                <TableCell>
                  {recipe.type === "income" ? "Recette" : "Dépense"}
                </TableCell>
                <TableCell
                  className={`text-right ${
                    recipe.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatAmount(recipe.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DriverRecipes;