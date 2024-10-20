import React from "react";
import { useRouter } from "next/router";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";

import LoginForm from "@/components/forms/LoginForm";
import { useLogin } from "@/hooks/api/auth";
import DefaultLayout from "@/layouts/default";
import { useUser } from "@/hooks/users";
import { User } from "@/types/user";

const LoginPage = () => {
  const router = useRouter();
  const { setUser } = useUser();
  const { mutate: login, status, error } = useLogin();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleLogin = (email: string, password: string) => {
    login(
      { email, password },
      {
        onSuccess: (data) => {
          console.log("Login successful!");
          const user: User = {
            id: data.id,
            username: data.username,
            email: data.email,
            isAdmin: data.isAdmin,
          };

          setUser(user);
          router.push("/match");
        },
        onError: (err) => {
          console.error("Login failed:", err);

          if (err?.response?.status === 401) {
            setErrorMessage("Incorrect email or password.");
          } else {
            setErrorMessage("An unexpected error occurred. Please try again.");
          }
        },
      },
    );
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const handleForgetPassword = () => {
    router.push("/forget-password");
  };

  // Log the mutation status for debugging
  console.log("Login mutation status: ", status);

  return (
    <DefaultLayout isLoggedIn={false}>
      <div className="flex items-start justify-center pt-[25vh]">
        <Card className="w-full max-w-lg p-8">
          <h2 className="text-3xl font-semibold text-center">
            Welcome to PeerPrep!
          </h2>

          <LoginForm onSubmit={handleLogin} />

          {/* Show loading state while the login is pending */}
          {status === "pending" && (
            <p className="text-gray-400 mt-4">Logging in...</p>
          )}

          {/* Show error message when login fails */}
          {status === "error" && (
            <p className="text-red-500 mt-4">{errorMessage}</p>
          )}

          <div className="mt-6 text-center">
            <h3>Don&apos;t have an account?</h3>
            <Button className="mt-2" onClick={handleRegister}>
              Register
            </Button>
          </div>

          <div className="mt-6 text-center">
            <h3> Forgot your password?</h3>
            <Button className="mt-2" onClick={handleForgetPassword}>
              Click Here
            </Button>
          </div>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default LoginPage;
