import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import apiService from "../services/api.service";

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
    <Button
      variant="outlined"
      size="large"
      fullWidth
      onClick={handleClick}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
      sx={{
        textTransform: "none",
        borderColor: "#dadce0",
        color: "#3c4043",
        "&:hover": {
          borderColor: "#dadce0",
          backgroundColor: "rgba(0,0,0,0.04)",
        },
      }}
      aria-label="Sign in with Google"
    >
      {loading ? "Redirecting…" : "Sign in with Google"}
    </Button>
  );
};

export default GoogleLoginButton;
