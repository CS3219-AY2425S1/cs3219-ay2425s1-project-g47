import React from "react";
import { useRouter } from "next/router";

import RegistrationForm from "@/components/forms/RegistrationForm";
import { useRegister } from "@/hooks/auth";
import DefaultLayout from "@/layouts/default";

const RegisterPage = () => {
  const router = useRouter();
  const { mutate: register, isPending, isError, error } = useRegister();

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
        },
      }
    );
  };

  return (
    <DefaultLayout>
      <div className="flex items-start justify-center pt-[25vh]">
        <div
          className="w-full max-w-lg p-8 rounded-lg shadow-lg"
          style={{ backgroundColor: "#19191b" }}
        >
          <h2 className="text-3xl font-semibold text-center text-white">
            Welcome to Peerprep!
          </h2>

          <RegistrationForm onSubmit={handleRegister} />

          {isError && <p className="text-red-500 mt-4">{error?.message}</p>}
          {isPending && <p className="text-gray-400 mt-4">Registering...</p>}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default RegisterPage;
