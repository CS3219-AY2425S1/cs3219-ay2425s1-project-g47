export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
}

export interface UserProfile {
  username: string;
  email: string;
  password: string;
}
