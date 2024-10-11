import React from "react";
import { useRouter } from "next/router";
import { Button } from "@nextui-org/button";

import ForgetPasswordForm from "@/components/forms/ForgetPasswordForm";  
import { useForgetPassword } from "@/hooks/auth";
import DefaultLayout from "@/layouts/default";

const ForgetPasswordPage = () => {
  const router = useRouter();
  const { mutate: forgetPassword, isPending, isError, error } = useForgetPassword();

  const handleForgetPassword = (email: string) => {
    forgetPassword(
      { email },  // Corrected to send an object, as expected by the backend
      {
        onSuccess: () => {
          // Optionally show a message to check their email, or redirect
          console.log("Password reset email sent!");
          router.push("/");
        },
        onError: (err) => {
          console.error("Forgot password failed:", err);
        },
      }
    );
  };


  const handleLogin = () => {
    router.push("/login");
  };


  return (
    <DefaultLayout>
      <div className="flex items-start justify-center pt-[25vh]">
        <div
          className="w-full max-w-lg p-8 rounded-lg shadow-lg"
          style={{ backgroundColor: "#19191b" }}
        >
          <h2 className="text-3xl font-semibold text-center text-white">
            Forgot Your Password?
          </h2>

          {/* ForgetPasswordForm component, with the correct onSubmit handler */}
          <ForgetPasswordForm onSubmit={handleForgetPassword} />

          {isError && <p className="text-red-500 mt-4">{error?.message}</p>}
          {isPending && <p className="text-gray-400 mt-4">Sending reset email...</p>}
          <div className="mt-6 text-center">

          <Button className="mt-2" onClick={handleLogin}>
          Back to Login
          </Button>
         </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ForgetPasswordPage;

