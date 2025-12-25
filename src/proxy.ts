export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/settings/:path*",
    // Skip api routes and static files
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
