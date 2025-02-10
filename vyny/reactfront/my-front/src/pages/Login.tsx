import { LoginForm } from "@/components/LoginForm";

const Login = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Espace Chauffeur</h1>
        <p className="text-gray-600">Connectez-vous avec votre code unique</p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;