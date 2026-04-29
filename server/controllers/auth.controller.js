const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const crypto = require("crypto");

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback"
);

const DEFAULT_ADMIN_EMAILS = ["kamaraj.developer@gmail.com"];
const ADMIN_EMAILS = [
  ...DEFAULT_ADMIN_EMAILS,
  ...(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
];

const DEFAULT_DOCTOR_EMAILS = ["kamaraj.balakrishnan.ext@veolia.com"];
const DOCTOR_EMAILS = [
  ...DEFAULT_DOCTOR_EMAILS,
  ...(process.env.DOCTOR_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
];

const isAdminEmail = (email = "") =>
  ADMIN_EMAILS.includes(String(email).trim().toLowerCase());
const isDoctorEmail = (email = "") =>
  DOCTOR_EMAILS.includes(String(email).trim().toLowerCase());
const getRoleForEmail = (email = "") => {
  if (isAdminEmail(email)) return "admin";
  if (isDoctorEmail(email)) return "doctor";
  return "user";
};

const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge,
  };
};

// 1. Verify Google Token and Authenticate
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    const normalizedEmail = String(email).trim().toLowerCase();
    const roleForLogin = getRoleForEmail(normalizedEmail);

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        username: name,
        profileImage: picture,
        role: roleForLogin,
        googleAccessToken: googleId,
      });
    } else {
      if (!user.googleAccessToken) {
        user.googleAccessToken = googleId;
      }
      if (user.role !== roleForLogin) {
        user.role = roleForLogin;
      }
      await user.save();
    }

    // 2. Create App Token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

   const tokenData = jwt.verify(accessToken, process.env.JWT_SECRET);
    // Send tokens as HTTP-only cookies
    res
      .cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000))
      .cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000))
      .status(200)
      .json({ message: "Login success", user, token: tokenData });
  } catch (err) {
    res.status(401).json({ error: `Invalid Google token ${err}` });
  }
};

// 5. Refresh Token Endpoint
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "No refresh token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) throw new Error();

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.cookie("accessToken", newAccessToken, getCookieOptions(15 * 60 * 1000));

        const tokenData = jwt.verify(newAccessToken, process.env.JWT_SECRET);

    res.status(200).json({ message: "Token refreshed", token: tokenData });
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

exports.verifyToken = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findOne({ _id: tokenData.id });
    if (user) {
      res.status(200).json({ message: "Token valid", token: tokenData, user });
    } else {
      res.status(404).json({ error: "Unauthorized" });
    }
  } catch (err) {
    res.status(401).json({ error: "Token expired or invalid" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logout success" });
};

// Redirect-based Google OAuth (no popup, avoids COOP issues)
const getRedirectUri = () =>
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

exports.getGoogleAuthUrl = (req, res) => {
  const state = crypto.randomBytes(32).toString("hex");
  const redirectUri = getRedirectUri();
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    state,
    prompt: "select_account",
  });
  res.cookie("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });
  res.json({ url });
};

exports.googleCallback = async (req, res) => {
  const { code, state } = req.query;
  const savedState = req.cookies?.google_oauth_state;
  if (!code || state !== savedState) {
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3001"}/login?error=invalid_callback`);
    return;
  }
  res.clearCookie("google_oauth_state");

  const redirectUri = getRedirectUri();
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials({ id_token: tokens.id_token });
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    const normalizedEmail = String(email).trim().toLowerCase();
    const roleForLogin = getRoleForEmail(normalizedEmail);

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        username: name,
        profileImage: picture,
        role: roleForLogin,
        googleAccessToken: tokens.access_token || googleId,
      });
    } else {
      if (!user.googleAccessToken) {
        user.googleAccessToken = tokens.access_token || googleId;
      }
      if (user.role !== roleForLogin) {
        user.role = roleForLogin;
      }
      await user.save();
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    res
      .clearCookie("google_oauth_state")
      .cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000))
      .cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000))
      .redirect(`${frontendUrl}/`);
  } catch (err) {
    console.error("Google callback error:", err?.response?.data || err?.message || err);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    res.redirect(`${frontendUrl}/login?error=google_login_failed`);
  }
};
