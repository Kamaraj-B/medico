import { useSearchParams } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
import {
  Box,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
  Alert,
} from "@mui/material";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  return (
    <Box
      sx={{
        minHeight: "90vh",
        fontFamily: '"Public Sans", "Noto Sans", sans-serif',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        margin: "30px auto",
        borderRadius: 5,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          maxWidth: 960,
          width: "100%",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Left Image Section */}
        <Box
          sx={{
            flex: 1,
            minHeight: 300,
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBIOnKBhqOMZ7z5IXxCa8c4srBVrA4muwdFvO2KjpMjmkXiGM9Su3a9mE_gYTl_-I15ZRFSIZWB4Ush_YZYlD6zpCr06abR02b4weynUZ85MLNMQ1lNCFj2vbtMDC2DtMM81TLGwOUb8G51dCktKC_9dew2gkABZf1HeQlMQMYSCLA9F32mtO_o5RcH0hS7DUQ0WgMIqUj7uOSvkdpZ-jfIkaE3175onhxx_efCUTgbRMCEroTQtXn6qUkyZhTgRzOE4kMCFS05MNeB")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: isMobile ? "none" : "block",
          }}
        />

        {/* Right Form Section */}
        <Box
          sx={{
            flex: 1,
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#101518",
                mb: 3,
              }}
            >
              Welcome to Medico
            </Typography>

            {error === "invalid_callback" && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Sign-in was cancelled or the session expired. Please try again.
              </Alert>
            )}
            {error === "google_login_failed" && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Google sign-in failed. Please try again.
              </Alert>
            )}

            {/* Google Button (redirect flow – no popup, no COOP issues) */}
            <GoogleLoginButton />
          </motion.div>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
