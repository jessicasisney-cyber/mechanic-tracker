import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Only these paths require login - the rest of the site (marketing pages,
// the customer tracking link, contact form) is intentionally public.
const PROTECTED_PATHS = [
  "/app",
  "/api/entries",
  "/api/photos",
  "/api/customer-updates",
  "/api/testimonials",
];

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED_PATHS.some((p) => path.startsWith(p));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isLoggedIn && path.startsWith("/login")) {
    return NextResponse.redirect(new URL("/app", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
