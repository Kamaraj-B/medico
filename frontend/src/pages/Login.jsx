import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { loginWithPassword, registerPatient, requestDoctorAccount } from "../store/slices/authSlice";
import GoogleLoginButton from "../components/GoogleLoginButton";

/** Apple logo as SVG — the  character often has no glyph on Windows. */
function AppleIconWhite() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="#fff"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.028 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.663-2.324-4.452-2.376-2-.08-3.616 1.12-4.548 1.12zm3.535-3.217c.832-.936 1.403-2.215 1.249-3.514-.854.038-1.89.573-2.502 1.292-.58.68-1.091 1.772-.954 2.823.865.066 1.743-.438 2.207-1.601" />
    </svg>
  );
}

const medicalCouncils = [
  "Andhra Pradesh Medical Council",
  "Delhi Medical Council",
  "Gujarat Medical Council",
  "Karnataka Medical Council",
  "Maharashtra Medical Council",
  "Tamil Nadu Medical Council",
  "Uttar Pradesh Medical Council",
  "West Bengal Medical Council",
];

const degreeOptions = {
  undergraduate: ["MBBS (Bachelor of Medicine and Bachelor of Surgery)"],
  postgraduate: [
    "MD - General Medicine",
    "MD - Paediatrics",
    "MD - Radiology",
    "MS - General Surgery",
    "MS - ENT",
    "MS - Orthopaedics",
    "DNB (Diplomate of National Board)",
    "Diploma - DGO (Gynaecology)",
    "Diploma - DCH (Child Health)",
    "Diploma - DO (Ophthalmology)",
  ],
};

const universities = [
  "Maharashtra University of Health Sciences (MUHS), Nashik",
  "Rajiv Gandhi University of Health Sciences (RGUHS), Bengaluru",
  "The Tamil Nadu Dr. M.G.R. Medical University, Chennai",
  "NTR University of Health Sciences, Vijayawada",
  "All India Institute of Medical Sciences (AIIMS), New Delhi",
  "Armed Forces Medical College (AFMC), Pune",
  "King George's Medical University (KGMU), Lucknow",
  "West Bengal University of Health Sciences (WBUHS), Kolkata",
];

const Login = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { loading, error, doctorRequestSubmitted, onboardingMessage } = useSelector((state) => state.auth);
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    username: "",
    email: "",
    specialization: "",
    experience: "",
    registrationNumber: "",
    medicalCouncil: "",
    registrationYear: "",
    degreeCategory: "",
    degree: "",
    university: "",
  });
  const [localMessage, setLocalMessage] = useState("");
  const [localError, setLocalError] = useState("");

  const isGoogleEmail = (value) =>
    /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(String(value || "").trim());

  const submitLabel = useMemo(() => {
    if (tab === "register") return "Create Account";
    if (tab === "doctorRequest") return "Submit Doctor Request";
    return "Sign In";
  }, [tab]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLocalMessage("");
    setLocalError("");

    if (tab === "login") {
      if (!isGoogleEmail(form.identifier)) {
        setLocalError("Only Google email addresses (@gmail.com) are allowed.");
        return;
      }
      const result = await dispatch(
        loginWithPassword({ identifier: form.identifier, password: form.password })
      );
      if (!result.error) {
        window.location.href = "/";
      }
      return;
    }

    if (tab === "register") {
      if (!isGoogleEmail(form.email)) {
        setLocalError("Please use a valid Google email address (@gmail.com).");
        return;
      }
      const result = await dispatch(
        registerPatient({
          username: form.username,
          email: form.email,
        })
      );
      if (!result.error) {
        setLocalMessage(result.payload?.message || "Please check your email for confirmation.");
      }
      return;
    }

    if (!isGoogleEmail(form.email)) {
      setLocalError("Please use a valid Google email address (@gmail.com).");
      return;
    }
    const result = await dispatch(
      requestDoctorAccount({
        username: form.username,
        email: form.email,
        specialization: form.specialization,
        experience: Number(form.experience) || 0,
        doctorVerification: {
          registrationNumber: form.registrationNumber,
          medicalCouncil: form.medicalCouncil,
          registrationYear: Number(form.registrationYear) || 0,
          degreeCategory: form.degreeCategory,
          degree: form.degree,
          university: form.university,
        },
      })
    );
    if (!result.error) {
      setLocalMessage(result.payload?.message || "Doctor request submitted. Please wait for admin approval.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        fontFamily: '"Public Sans", "Noto Sans", sans-serif',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 1.5, sm: 2.5 },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          maxWidth: 980,
          width: "100%",
          borderRadius: 5,
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

        <Box
          sx={{
            flex: 1,
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxHeight: { xs: "calc(100vh - 24px)", md: 760 },
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              borderRadius: 999,
              backgroundColor: "#f3f4f6",
              border: "1px solid #e5e7eb",
              p: 0.5,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              mb: 3,
            }}
          >
            {[
              { id: "login", label: "Login" },
              { id: "register", label: "Sign Up" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "9px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  backgroundColor: tab === item.id ? "#fff" : "transparent",
                  color: tab === item.id ? "#111827" : "#6b7280",
                  boxShadow: tab === item.id ? "0 1px 2px rgba(15,23,42,.12)" : "none",
                }}
              >
                {item.label}
              </button>
            ))}
          </Box>

          {error ? <Alert severity="error" sx={{ mb: 2 }}>{String(error)}</Alert> : null}
          {localError ? <Alert severity="error" sx={{ mb: 2 }}>{localError}</Alert> : null}
          {localMessage || doctorRequestSubmitted || onboardingMessage ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {localMessage || onboardingMessage || "Doctor request submitted. Please wait for admin approval."}
            </Alert>
          ) : null}

          <Typography sx={{ fontSize: 36, fontWeight: 800, color: "#1f2937", letterSpacing: "-0.02em", mb: 0.5 }}>
            {tab === "login" ? "Welcome Back" : "Create Account"}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6b7280", mb: 2.3 }}>
            {tab === "login"
              ? "Please enter your credentials to access your portal."
              : "Enter your details and we'll send a password setup email."}
          </Typography>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            {tab === "login" ? (
              <>
                <label style={labelStyle}>Email Address</label>
                <input
                  placeholder="name@example.com"
                  value={form.identifier}
                  onChange={(e) => setForm((prev) => ({ ...prev, identifier: e.target.value }))}
                  style={inputStyle}
                  required
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                  <label style={labelStyle}>Password</label>
                  <button type="button" style={linkBtnStyle}>Forgot Password?</button>
                </div>
                <input
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  style={inputStyle}
                  required
                />
              </>
            ) : (
              <>
                <label style={labelStyle}>Full Name</label>
                <input
                  placeholder="Enter full name"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  style={inputStyle}
                  required
                />
                <label style={labelStyle}>Email Address</label>
                <input
                  placeholder="name@example.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  style={inputStyle}
                  required
                />
                {tab === "doctorRequest" ? (
                  <>
                    <label style={labelStyle}>Specialization</label>
                    <input
                      placeholder="e.g. General Medicine"
                      value={form.specialization}
                      onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))}
                      style={inputStyle}
                      required
                    />
                    <label style={labelStyle}>Experience (years)</label>
                    <input
                      placeholder="0"
                      type="number"
                      min="0"
                      value={form.experience}
                      onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))}
                      style={inputStyle}
                    />
                    <label style={labelStyle}>Medical Registration Number</label>
                    <input
                      placeholder="Enter registration number"
                      value={form.registrationNumber}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, registrationNumber: e.target.value }))
                      }
                      style={inputStyle}
                      required
                    />
                    <label style={labelStyle}>Medical Council</label>
                    <select
                      value={form.medicalCouncil}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, medicalCouncil: e.target.value }))
                      }
                      style={inputStyle}
                      required
                    >
                      <option value="">Select Medical Council</option>
                      {medicalCouncils.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                    <label style={labelStyle}>Registration Year</label>
                    <input
                      placeholder="YYYY"
                      type="number"
                      min="1950"
                      max={new Date().getFullYear()}
                      value={form.registrationYear}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, registrationYear: e.target.value }))
                      }
                      style={inputStyle}
                      required
                    />
                    <label style={labelStyle}>Degree Category</label>
                    <select
                      value={form.degreeCategory}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, degreeCategory: e.target.value, degree: "" }))
                      }
                      style={inputStyle}
                      required
                    >
                      <option value="">Degree Category</option>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="postgraduate">Postgraduate</option>
                    </select>
                    <label style={labelStyle}>Degree</label>
                    <select
                      value={form.degree}
                      onChange={(e) => setForm((prev) => ({ ...prev, degree: e.target.value }))}
                      style={inputStyle}
                      required
                    >
                      <option value="">Select Degree</option>
                      <optgroup label="Undergraduate">
                        {degreeOptions.undergraduate.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Postgraduate">
                        {degreeOptions.postgraduate.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </optgroup>
                    </select>
                    <label style={labelStyle}>University</label>
                    <select
                      value={form.university}
                      onChange={(e) => setForm((prev) => ({ ...prev, university: e.target.value }))}
                      style={inputStyle}
                      required
                    >
                      <option value="">Select University</option>
                      {universities.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </>
                ) : null}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "11px 14px",
                fontWeight: 700,
                color: "#fff",
                backgroundColor: "#0058be",
                cursor: "pointer",
                opacity: loading ? 0.65 : 1,
                marginTop: 4,
              }}
            >
              {loading ? "Please wait..." : submitLabel}
            </button>

            {tab === "login" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.14em" }}>
                    OR CONTINUE WITH
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <GoogleLoginButton />
                  <button
                    type="button"
                    style={{
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 14px",
                      fontSize: 15,
                      fontWeight: 600,
                      background: "#000",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      minHeight: 44,
                    }}
                  >
                    <AppleIconWhite />
                    Continue with Apple
                  </button>
                </div>
              </>
            ) : null}

            {tab === "register" ? (
              <button
                type="button"
                onClick={() => setTab("doctorRequest")}
                style={linkBtnStyle}
              >
                Apply as Doctor Instead
              </button>
            ) : null}

            {tab === "doctorRequest" ? (
              <button type="button" onClick={() => setTab("register")} style={linkBtnStyle}>
                Back to Patient Signup
              </button>
            ) : null}

            <Typography sx={{ textAlign: "center", mt: 0.5, fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>
              By signing in, you agree to our{" "}
              <span style={{ color: "#1d4ed8" }}>Care Terms</span> and{" "}
              <span style={{ color: "#1d4ed8" }}>Privacy Shield</span>.
            </Typography>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

const inputStyle = {
  border: "1px solid #dbe2ea",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  outline: "none",
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#334155",
  marginTop: 2,
};

const linkBtnStyle = {
  border: "none",
  background: "transparent",
  color: "#1d4ed8",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "left",
  padding: 0,
};

export default Login;
