import ApiError from "./ApiError.js";

/**
 * Standardizes user response payload across all authentication routes.
 * Ensures consistent output for id, username, email, avatar, connected providers, and password status.
 */
export function formatUserResponse(user) {
  if (!user) return null;

  // Extract array of provider names (e.g. ['google']) if loaded from database
  const providers = Array.isArray(user.providers)
    ? user.providers.map((p) => p.providerName || p)
    : [];

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar || null,
    providers,
    hasPassword: Boolean(user.password),
    createdAt: user.createdAt,
  };
}

/**
 * Verifies a Google OAuth2 access token by calling Google's userinfo endpoint.
 * Google validates the token server-side and returns verified user information.
 * Enforces email_verified claim before trusting the email address.
 *
 * @param {string} accessToken - The OAuth2 access token from useGoogleLogin() implicit flow
 * @returns {Promise<{sub: string, email: string, name: string, picture: string|null}>}
 */
export async function verifyGoogleToken(accessToken) {
  if (!accessToken || typeof accessToken !== "string") {
    throw new ApiError(400, "Google access token is required");
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new ApiError(401, `Google token validation failed (${response.status})`);
    }

    const payload = await response.json();

    if (!payload || !payload.sub) {
      throw new ApiError(401, "Invalid Google token payload");
    }

    // Critical security check: Ensure Google has verified ownership of this email address
    if (!payload.email_verified) {
      throw new ApiError(401, "Google account email is not verified");
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || "",
      picture: payload.picture || null,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, `Google token authentication failed: ${error.message}`);
  }
}