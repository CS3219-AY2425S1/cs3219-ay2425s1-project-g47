import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import axios from "@/utils/axios";

// No auth required
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forget-password",
  "/reset-password",
];

const validateToken = async (): Promise<any> => {
  try {
    const response = await axios.get("/user-service/auth/verify-token");
    return response.data;
  } catch (error) {
    console.error("Unexpected error:", error);
    throw new Error("Unexpected error during token validation");
  }
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;

  // Allow access to public routes without checking tokens
  if (publicRoutes.some((route) => url.pathname === route)) {
    return NextResponse.next();
  }

  // If no access token and the user is not on a public route, redirect to login
  if (!accessToken) {
    console.log("No access token found, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // If the access token is present, validate it
  const decodedAccessToken = await validateToken();

  // If token validation fails, redirect to login
  if (!decodedAccessToken) {
    console.log("Invalid access token, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Extract user role from the decoded token (assuming the role is stored in the token)
  const isAdmin = decodedAccessToken.isAdmin;

  // Check if the user is trying to access an admin route (all routes starting with /admin)
  if (url.pathname.startsWith("/admin") && !isAdmin) {
    console.log("User is not an admin, redirecting to 403 page");
    return NextResponse.redirect(new URL("/403", req.nextUrl)); // 403 Forbidden
  }

  console.log("User is authenticated");

  return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
