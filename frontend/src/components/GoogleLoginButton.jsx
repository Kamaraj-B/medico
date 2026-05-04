import { useState } from "react";
import apiService from "../services/api.service";

function GoogleGIcon() {
  return (
    <svg
      className="mr-3 h-[18px] w-[18px] shrink-0"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.044l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.44 2.017.957 4.956L3.964 7.288C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

/**
 * Redirect-based Google sign-in. Uses full-page redirect to Google and back,
 * so no popup and no Cross-Origin-Opener-Policy (COOP) issues.
 */
const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/auth/google/url");
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
    } catch (err) {
      console.error("Google auth URL failed:", err);
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full min-h-[44px] items-center justify-center rounded-[10px] border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-70"
      aria-label="Sign in with Google"
    >
      {loading ? (
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600"
          aria-hidden="true"
        />
      ) : (
        <>
          <GoogleGIcon />
          Sign in with Google
        </>
      )}
    </button>
  );
};

export default GoogleLoginButton;
