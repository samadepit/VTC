import { AdminLoginForm } from "../components/AdminLoginForm";

const AdminLogin = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Espace Administrateur</h1>
          <p className="mt-2 text-gray-600">Connectez-vous pour accéder à votre espace</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
};

export default AdminLogin;
