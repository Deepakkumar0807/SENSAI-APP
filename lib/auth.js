import { auth } from "@clerk/nextjs/server";

/**
 * Get the current user ID from the request
 * @param {Request} req - The incoming request
 * @returns {string|null} The user ID or null if not authenticated
 */
export async function getUserId(req) {
  const { userId } = await auth();
  return userId;
}

/**
 * Check if the current user is authenticated
 * @param {Request} req - The incoming request
 * @returns {boolean} True if authenticated, false otherwise
 */
export async function isAuthenticated(req) {
  const userId = await getUserId(req);
  return !!userId;
}

/**
 * Redirect to sign-in if not authenticated
 * @param {Request} req - The incoming request
 * @returns {Response|null} Redirect response or null if authenticated
 */
export async function requireAuth(req) {
  const { redirectToSignIn } = await auth();
  return redirectToSignIn();
}


