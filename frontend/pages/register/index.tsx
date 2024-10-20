import React from "react";
import { useRouter } from "next/router";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";

import RegistrationForm from "@/components/forms/RegistrationForm";
import { useRegister } from "@/hooks/api/auth";
import DefaultLayout from "@/layouts/default";

const RegisterPage = () => {
  const router = useRouter();
  const { mutate: register, isPending, isError, error } = useRegister();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleRegister = (
    username: string,
    email: string,
    password: string
  ) => {
    register(
      { username, email, password },
      {
        onSuccess: () => {
          router.push("/login");
        },
        onError: (err) => {
          console.error("Registration failed:", err);
          setErrorMessage("An unexpected error occurred. Please try again.");
        },
      }
    );
  };
  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <DefaultLayout isLoggedIn={false}>
      <div className="flex items-start justify-center pt-[25vh]">
        <Card className="w-full max-w-lg p-8">
          <h2 className="text-3xl font-semibold text-center">
            Welcome to Peerprep!
          </h2>

          <RegistrationForm onSubmit={handleRegister} />

          {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
          {isPending && <p className="text-gray-400 mt-4">Registering...</p>}

          <div className="mt-6 text-center">
            <h3> Have an account?</h3>
            <Button className="mt-2" onClick={handleLogin}>
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default RegisterPage;
