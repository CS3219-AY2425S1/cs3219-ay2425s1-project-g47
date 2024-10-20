import React from "react";
import { useRouter } from "next/router";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";

import ForgetPasswordForm from "@/components/forms/ForgetPasswordForm";
import { useForgetPassword } from "@/hooks/api/auth";
import DefaultLayout from "@/layouts/default";

const ForgetPasswordPage = () => {
  const router = useRouter();
  const {
    mutate: forgetPassword,
    isPending,
    isError,
    error,
  } = useForgetPassword();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleForgetPassword = (email: string) => {
    forgetPassword(
      { email }, // Corrected to send an object, as expected by the backend
      {
        onSuccess: () => {
          // Optionally show a message to check their email, or redirect
          console.log("Password reset email sent!");
          router.push("/");
        },
        onError: (err) => {
          console.error("Forgot password failed:", err);
          if (err?.response?.status === 401) {
            setErrorMessage("Please enter a valid registered email.");
          } else {
            setErrorMessage("An unexpected error occurred. Please try again.");
          }
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
            Forgot Your Password?
          </h2>

          {/* ForgetPasswordForm component, with the correct onSubmit handler */}
          <ForgetPasswordForm onSubmit={handleForgetPassword} />

          {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
          {isPending && (
            <p className="text-gray-400 mt-4">Sending reset email...</p>
          )}
          <div className="mt-6 text-center">
            <Button className="mt-2" onClick={handleLogin}>
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default ForgetPasswordPage;
