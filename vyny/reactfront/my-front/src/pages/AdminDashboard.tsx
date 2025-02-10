import { CodeGenerator } from "@/components/CodeGenerator";
import ListeChauffeurRecette  from "@/components/ListeChauffeurRecette";

const AdminDashboard = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid gap-8">
      <CodeGenerator />
      <ListeChauffeurRecette />
    </div>
  </main>
  );
};

export default AdminDashboard;
