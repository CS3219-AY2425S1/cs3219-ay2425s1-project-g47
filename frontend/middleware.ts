import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forget-password",
  "/reset-password",
];

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const validateToken = async (accessToken: string | undefined): Promise<any> => {
  try {
    const response = await fetch(
      `${baseURL}/api/user-service/auth/verify-token`,
      {
        method: "GET",
        headers: {
          Cookie: `accessToken=${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Token validation failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Unexpected error:", error);
  }
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;

  // Allow access to public routes without checking tokens
  if (publicRoutes.some((route) => url.pathname === route)) {
    return NextResponse.next();
  }

  // If the access token is present, validate it
  try {
    const decodedAccessToken = await validateToken(accessToken);

    if (!decodedAccessToken) {
      console.log("Invalid access token, redirecting to login");

      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // Extract user role from the decoded token (assuming the role is stored in the token)
    const isAdmin = decodedAccessToken.data.isAdmin;

    // Check if the user is trying to access an admin route (all routes starting with /admin)
    if (url.pathname.startsWith("/admin") && !isAdmin) {
      console.log("User is not an admin, redirecting to 403 page");

      return NextResponse.redirect(new URL("/403", req.nextUrl)); // 403 Forbidden
    }

    console.log("User is authenticated");

    return NextResponse.next();
  } catch (error) {
    console.error("Token validation failed, redirecting to login:", error);

    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
}

// Apply middleware to specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
