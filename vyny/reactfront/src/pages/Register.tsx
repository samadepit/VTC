import { RegistrationForm } from "@/components/RegistrationForm";

const Register = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inscription Chauffeur</h1>
        <p className="text-gray-600">Créez votre compte chauffeur</p>
      </div>
      <RegistrationForm />
    </div>
  );
};

export default Register;