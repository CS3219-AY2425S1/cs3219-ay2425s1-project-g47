// src/services/authService.ts  
import { useMutation } from "@tanstack/react-query";
import axios from "@/utils/axios";
import { AxiosError } from "axios";

// Define the shape of the login response
interface LoginResponse {   
  accessToken: string;
  id: string;
  username: string;
  email: string;    
  isAdmin: boolean;
  createdAt: string;
}

// Define the credentials object
interface Credentials {
  email: string;
  password: string;
}

// Login: Send credentials to the server and return the response
const login = async (credentials: Credentials): Promise<LoginResponse> => {
  const response = await axios.post("/user-service/auth/login", credentials);
  return response.data.data;
};  

// Login hook
export const useLogin = () => {
  return useMutation<LoginResponse, AxiosError, Credentials>({
    mutationFn: login,
    onSuccess: (data) => {
      // Store the accessToken in localStorage
      localStorage.setItem("accessToken", data.accessToken);
      console.log("Login successful!", data);
    },
    onError: (error) => {
      console.error("Login failed", error);
      throw error.message || "Login failed!";
    },
  });
};

// Define the shape of the registration response
interface RegisterResponse {
  accessToken: string;
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

// Define the structure for the registration credentials object
interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// Registration: Send user details to the backend and return the response
const register = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
  const response = await axios.post("/user-service/users", credentials);
  return response.data.data;
};

// Registration hook
export const useRegister = () => {
  return useMutation<RegisterResponse, AxiosError, RegisterCredentials>({
    mutationFn: register,
    onSuccess: (data) => {
      // Store the accessToken in localStorage
      localStorage.setItem("accessToken", data.accessToken);
      console.log("Registration successful!", data);
    },
    onError: (error) => {
      console.error("Registration failed", error);
      throw error.message || "Registration failed!";
    },
  });
};

