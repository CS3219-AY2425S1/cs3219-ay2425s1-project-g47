import React from "react";
import { useRouter } from "next/router";
import { Button } from "@nextui-org/button";

import LoginForm from "@/components/forms/LoginForm";
import { useLogin } from "@/hooks/auth";
import DefaultLayout from "@/layouts/default";

const LoginPage = () => {
  const router = useRouter();
  const { mutate: login, isPending, isError, error } = useLogin();

  const handleLogin = (email: string, password: string) => {
    login(
      { email, password },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (err) => {
          console.error("Login failed:", err);
        },
      }
    );
  };

  const handleRegister = () => {
    router.push("/register");
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

          <LoginForm onSubmit={handleLogin} />

          {isError && <p className="text-red-500 mt-4">{error?.message}</p>}
          {isPending && <p className="text-gray-400 mt-4">Logging in...</p>}

          <div className="mt-6 text-center">
            <h3 className="text-white">Don&apos;t have an account?</h3>
            <Button className="mt-2" onClick={handleRegister}>
              Register
            </Button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default LoginPage;
