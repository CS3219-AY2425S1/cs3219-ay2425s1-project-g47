"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";

import ForgetPasswordForm from "@/components/forms/ForgetPasswordForm";
import { useForgetPassword } from "@/hooks/api/auth";

export default function Page() {
  const router = useRouter();
  const { mutate: forgetPassword, isPending } = useForgetPassword();
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const handleForgetPassword = (email: string) => {
    forgetPassword(
      { email },
      {
        onSuccess: () => {
          // Show the success message in place
          setStatusMessage("Reset email sent!");
        },
        onError: (err) => {
          console.error("Forgot password failed:", err);
          if (err?.response?.status === 401) {
            setStatusMessage("Please enter a valid registered email.");
          } else {
            setStatusMessage("An unexpected error occurred. Please try again.");
          }
        },
      },
    );
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <div className="flex items-start justify-center pt-[5vh]">
      <Card className="w-full max-w-lg p-8">
        <h2 className="text-3xl font-semibold text-center">
          Forgot Your Password?
        </h2>

        {/* ForgetPasswordForm component, with the correct onSubmit handler */}
        <ForgetPasswordForm onSubmit={handleForgetPassword} />

        {statusMessage && <p className="text-gray-500 mt-4">{statusMessage}</p>}
        {isPending && !statusMessage && (
          <p className="text-gray-400 mt-4">Sending reset email...</p>
        )}
        <div className="mt-6 text-center">
          <Button className="mt-2" onClick={handleLogin}>
            Back to Login
          </Button>
        </div>
      </Card>
    </div>
  );
}

