import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

//only protect the index page
const isProtectedRoute = createRouteMatcher(["/"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", // Don't run middleware on static files
    "/", // Run middleware on index page
    "/(api)(.*)",
  ], // Run middleware on API routes
};
