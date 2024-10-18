import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forget-password",
    "/reset-password",
  ];

  // Allow access to public routes without checking tokens
  if (publicRoutes.some((route) => url.pathname === route)) {
    return NextResponse.next();
  }

  // If both access token and refresh token are present, allow the user to proceed
  if (accessToken && refreshToken) {
    return NextResponse.next();
  }

  // If no access token and the user is not on a public route, redirect to login
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
