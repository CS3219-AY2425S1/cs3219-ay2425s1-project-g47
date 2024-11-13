"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

import axios from "@/utils/axios";
import {
  LoginResponse,
  Credentials,
  RegisterResponse,
  RegisterCredentials,
  LogoutResponse,
} from "@/types/auth";
import { User } from "@/types/user";

// Login: Send credentials to the server and return the response
const login = async (credentials: Credentials): Promise<LoginResponse> => {
  const response = await axios.post("/user-service/auth/login", credentials);

  return response.data.data;
};

// Login hook
export const useLogin = () => {
  return useMutation<LoginResponse, AxiosError, Credentials>({
    mutationFn: login,
  });
};

// Registration: Send user details to the backend and return the response
const register = async (
  credentials: RegisterCredentials,
): Promise<RegisterResponse> => {
  const response = await axios.post("/user-service/users", credentials);

  return response.data.data;
};

// Registration hook
export const useRegister = () => {
  return useMutation<RegisterResponse, AxiosError, RegisterCredentials>({
    mutationFn: register,
    onSuccess: () => {
      console.log("Registration successful!");
    },
    onError: () => {
      console.error("Registration failed!");
    },
  });
};

interface ForgetPasswordResponse {
  message: string; // Assuming the backend sends a success message when an email is sent
}

// Define the structure for the forget password credentials object
interface ForgetPasswordCredentials {
  email: string;
}

// ForgetPassword: Send user email to the backend and return the response
const forgetPassword = async (
  credentials: ForgetPasswordCredentials,
): Promise<ForgetPasswordResponse> => {
  const response = await axios.post(
    "/user-service/auth/forgot-password",
    credentials,
  );

  return response.data.data;
};

// ForgetPassword hook
export const useForgetPassword = () => {
  return useMutation<
    ForgetPasswordResponse,
    AxiosError,
    ForgetPasswordCredentials
  >({
    mutationFn: forgetPassword,
    onSuccess: (data) => {
      // Handle success response (for example, show a notification)
      console.log("Reset email sent successfully!", data);
    },
    onError: (error) => {
      // Handle error response
      console.error("Reset email failed", error);
      throw error.message || "Failed to send reset email!";
    },
  });
};

interface ResetPasswordCredentials {
  tokenString: string; // The reset token provided in the URL
  newPassword: string; // The new password entered by the user
}

interface ResetPasswordResponse {
  message: string;
}

// Decode the JWT token to extract the user ID
interface DecodedToken {
  id: string;
}

// Function to handle the reset password logic (fetch user and then patch password)
const resetPassword = async (
  credentials: ResetPasswordCredentials,
): Promise<ResetPasswordResponse> => {
  // Step 1: Decode the token to get the user ID
  const decodedToken: DecodedToken = jwtDecode(credentials.tokenString);
  const userId = decodedToken.id;

  // Prepare the Authorization header with the JWT access token
  const config = {
    headers: {
      Authorization: `Bearer ${credentials.tokenString}`, // Include the JWT token in the header
    },
  };

  console.log(config);

  // Step 2: Fetch the user using the userId (GET request with Authorization)
  const userResponse = await axios.get(`/user-service/users/${userId}`, config);
  const user = userResponse.data;

  if (!user) {
    throw new Error("User not found");
  }

  // Step 3: Patch the password using the user ID (PATCH request with Authorization)
  const patchResponse = await axios.patch(
    `/user-service/users/${userId}`,
    {
      password: credentials.newPassword,
    },
    config,
  );

  return patchResponse.data;
};

// ResetPassword hook using react-query's useMutation
export const useResetPassword = () => {
  return useMutation<
    ResetPasswordResponse,
    AxiosError,
    ResetPasswordCredentials
  >({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      // Handle success response (e.g., show a notification)
      console.log("Password reset successfully!", data);
    },
    onError: (error) => {
      // Handle error response (e.g., show an error message)
      console.error("Password reset failed", error);
      throw error.message || "Failed to reset password!";
    },
  });
};

const logout = async (): Promise<LogoutResponse> => {
  const response = await axios.post("/user-service/auth/logout");

  return response.data.message;
};

// Login hook
export const useLogout = () => {
  return useMutation<LogoutResponse, AxiosError>({
    mutationFn: logout,
    onSuccess: () => {
      console.log("Logout successful!");
    },
    onError: () => {
      console.error("Logout failed!");
    },
  });
};

const verifyToken = async () => {
  const response = await axios.get(`/user-service/auth/verify-token`);

  return response.data.data;
};

export const useVerifyToken = () => {
  return useQuery<User, AxiosError>({
    queryKey: ["verifyToken"],
    queryFn: () => verifyToken(),
  });
};
