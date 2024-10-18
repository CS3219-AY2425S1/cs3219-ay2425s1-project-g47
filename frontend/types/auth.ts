// Define the shape of the login response
export interface LoginResponse {
  accessToken: string;
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

// Define the credentials object
export interface Credentials {
  email: string;
  password: string;
}

// Define the shape of the registration response
export interface RegisterResponse {
  accessToken: string;
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

// Define the structure for the registration credentials object
export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface LogoutResponse {
  message: string;
}