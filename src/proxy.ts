import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/login", "/privacy", "/terms"];

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const isPublicPage = PUBLIC_PATHS.some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );

  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isLoggedIn && req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
