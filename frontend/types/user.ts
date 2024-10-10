export interface User {
  userId?: string; // Unique identifier for the user
  username: string; // Username
  email: string; // Email
  password: string; // Password 
  createdAt: string; // Date the question was created
  isAdmin: boolean; // Whether the user is an admin
}