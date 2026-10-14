import React from "react";
import { useGoogleLogin } from "@react-oauth/google";

// Google logo SVG — authentic brand mark
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const labelMap = {
  continue_with: "Continue with Google",
  signup_with: "Sign up with Google",
  link_with: "Link Google Account",
};

/**
 * Fully custom Google button that uses useGoogleLogin() from @react-oauth/google.
 * Sends an OAuth2 access token (implicit flow) — backend verifies via Google userinfo API.
 *
 * @param {function} onSuccess  - Called with { access_token } on success
 * @param {function} onError    - Called with error object on failure
 * @param {"continue_with"|"signup_with"|"link_with"} text  - Button label variant
 * @param {boolean}  isLoading  - Shows inline spinner and disables button
 */
const GoogleButton = ({
  onSuccess,
  onError,
  text = "continue_with",
  isLoading = false,
}) => {
  const login = useGoogleLogin({
    flow: "implicit",
    onSuccess: (tokenResponse) => {
      if (onSuccess) onSuccess(tokenResponse);
    },
    onError: (errorResponse) => {
      // Differentiate user cancellation from real errors
      if (
        errorResponse?.error === "access_denied" ||
        errorResponse?.error === "popup_closed_by_user"
      ) {
        if (onError) onError({ cancelled: true, ...errorResponse });
      } else {
        if (onError) onError(errorResponse);
      }
    },
    onNonOAuthError: (nonOAuthError) => {
      if (onError) onError(nonOAuthError);
    },
  });

  const label = labelMap[text] ?? "Continue with Google";

  return (
    <button
      type="button"
      onClick={() => !isLoading && login()}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-[#131314] border border-white/[0.12] hover:bg-[#1a1a1b] hover:border-white/[0.22] active:bg-[#111] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
    >
      {isLoading ? (
        <>
          <span className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin shrink-0" />
          <span className="text-sm font-medium text-white/70">Connecting to Google...</span>
        </>
      ) : (
        <>
          <span className="shrink-0 group-hover:scale-105 transition-transform duration-200">
            <GoogleLogo />
          </span>
          <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors duration-200">
            {label}
          </span>
        </>
      )}
    </button>
  );
};

export default GoogleButton;

