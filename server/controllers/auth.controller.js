const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sendEmail = require("../config/sendMail");
const emailTemplate = require("../utils/mailTemplate");

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

const ACCESS_COOKIE_AGE_MS = 15 * 60 * 1000;
const REFRESH_COOKIE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const signAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

const signRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });

const buildAuthResponse = (user, accessToken) => {
  const tokenData = jwt.verify(accessToken, process.env.JWT_SECRET);
  return {
    message: "Login success",
    token: tokenData,
    user,
    requirePasswordChange: Boolean(user.requirePasswordChange),
    accountStatus: user.accountStatus,
  };
};

const setSessionCookies = (res, accessToken, refreshToken) =>
  res
    .cookie("accessToken", accessToken, getCookieOptions(ACCESS_COOKIE_AGE_MS))
    .cookie("refreshToken", refreshToken, getCookieOptions(REFRESH_COOKIE_AGE_MS));

const passwordPolicyValid = (password = "") =>
  /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(String(password));

const adminOnly = (req, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
};

const getFrontendBase = () => process.env.FRONTEND_URL || "http://localhost:3001";

const createSetupToken = (userId) =>
  jwt.sign({ userId, type: "password_setup" }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

const MEDICAL_COUNCILS = [
  "Andhra Pradesh Medical Council",
  "Delhi Medical Council",
  "Gujarat Medical Council",
  "Karnataka Medical Council",
  "Maharashtra Medical Council",
  "Tamil Nadu Medical Council",
  "Uttar Pradesh Medical Council",
  "West Bengal Medical Council",
];

const UNIVERSITIES = [
  "Maharashtra University of Health Sciences (MUHS), Nashik",
  "Rajiv Gandhi University of Health Sciences (RGUHS), Bengaluru",
  "The Tamil Nadu Dr. M.G.R. Medical University, Chennai",
  "NTR University of Health Sciences, Vijayawada",
  "All India Institute of Medical Sciences (AIIMS), New Delhi",
  "Armed Forces Medical College (AFMC), Pune",
  "King George's Medical University (KGMU), Lucknow",
  "West Bengal University of Health Sciences (WBUHS), Kolkata",
];

const DEGREES = {
  undergraduate: [
    "MBBS (Bachelor of Medicine and Bachelor of Surgery)",
  ],
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

// Password-based patient registration
exports.register = async (req, res) => {
  try {
    const { username, email } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!username || !normalizedEmail) {
      return res.status(400).json({ error: "username and email are required" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const user = await User.create({
      username: String(username).trim(),
      email: normalizedEmail,
      passwordHash: "",
      role: "user",
      accountStatus: "active",
      requirePasswordChange: true,
      googleAccessToken: "",
    });

    const setupToken = createSetupToken(user._id);
    const setupLink = `${getFrontendBase()}/force-password-change?token=${encodeURIComponent(setupToken)}`;
    const html = emailTemplate.appointmentCardTemplate(
      "Complete Your Medico Account",
      `<p>Hello <b>${user.username}</b>,</p><p>Your account request has been received. Click below to confirm your account and set your password.</p><p>This link expires in 24 hours.</p>`,
      "Confirm Account",
      setupLink
    );
    await sendEmail(user.email, "Confirm your Medico account", "", html);

    return res.status(201).json({
      message: "Registration received. Please check your email to confirm account setup.",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Registration failed" });
  }
};

// Doctor self-registration request (pending admin approval)
exports.doctorRequest = async (req, res) => {
  try {
    const {
      username,
      email,
      specialization,
      experience,
      availableDays = [],
      availableTime = {},
      facilityIds = [],
      doctorVerification = {},
    } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!username || !normalizedEmail || !specialization) {
      return res
        .status(400)
        .json({ error: "username, email and specialization are required" });
    }

    const registrationNumber = String(doctorVerification.registrationNumber || "").trim();
    const medicalCouncil = String(doctorVerification.medicalCouncil || "").trim();
    const registrationYear = Number(doctorVerification.registrationYear);
    const degreeCategory = String(doctorVerification.degreeCategory || "").trim();
    const degree = String(doctorVerification.degree || "").trim();
    const university = String(doctorVerification.university || "").trim();

    if (
      !registrationNumber ||
      !medicalCouncil ||
      !registrationYear ||
      !degreeCategory ||
      !degree ||
      !university
    ) {
      return res.status(400).json({
        error:
          "doctorVerification fields are required: registrationNumber, medicalCouncil, registrationYear, degreeCategory, degree, university",
      });
    }

    if (!MEDICAL_COUNCILS.includes(medicalCouncil)) {
      return res.status(400).json({ error: "Invalid medical council selected" });
    }
    if (!UNIVERSITIES.includes(university)) {
      return res.status(400).json({ error: "Invalid university selected" });
    }
    if (!Object.prototype.hasOwnProperty.call(DEGREES, degreeCategory)) {
      return res.status(400).json({ error: "Invalid degree category selected" });
    }
    if (!DEGREES[degreeCategory].includes(degree)) {
      return res.status(400).json({ error: "Invalid degree selected for category" });
    }
    if (registrationYear < 1950 || registrationYear > new Date().getFullYear()) {
      return res.status(400).json({ error: "Invalid registration year" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: "A user with this email already exists" });
    }

    const user = await User.create({
      username: String(username).trim(),
      email: normalizedEmail,
      passwordHash: "",
      role: "doctor",
      accountStatus: "pendingApproval",
      requirePasswordChange: true,
      specialization,
      experience: Number(experience) || 0,
      availableDays,
      availableTime,
      facilityIds,
      doctorVerification: {
        registrationNumber,
        medicalCouncil,
        registrationYear,
        degreeCategory,
        degree,
        university,
      },
      googleAccessToken: "",
      reviewedAt: null,
      approvedAt: null,
      rejectedReason: "",
    });

    return res.status(201).json({
      message: "Doctor request submitted and pending admin approval",
      userId: user._id,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Doctor request failed" });
  }
};

// Password login (patient/doctor/admin)
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const value = String(identifier || "").trim();
    if (!value || !password) {
      return res.status(400).json({ error: "identifier and password are required" });
    }

    const query = value.includes("@")
      ? { email: value.toLowerCase() }
      : { username: new RegExp(`^${value}$`, "i") };
    const user = await User.findOne(query);
    if (!user?.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.accountStatus === "pendingApproval") {
      return res.status(403).json({ error: "Your doctor request is pending admin approval" });
    }
    if (user.accountStatus === "rejected") {
      return res.status(403).json({
        error: user.rejectedReason
          ? `Doctor request rejected: ${user.rejectedReason}`
          : "Your doctor request was rejected",
      });
    }
    if (user.accountStatus === "suspended") {
      return res.status(403).json({ error: "Account suspended. Contact support." });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    return setSessionCookies(res, accessToken, refreshToken)
      .status(200)
      .json(buildAuthResponse(user, accessToken));
  } catch (err) {
    return res.status(500).json({ error: err.message || "Login failed" });
  }
};

// Authenticated password change endpoint (forced reset compatible)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: "newPassword is required" });
    }
    if (!passwordPolicyValid(newPassword)) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 chars and include letters and numbers" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.passwordHash) {
      return res.status(400).json({ error: "Password login is not initialized for this account" });
    }

    if (!user.requirePasswordChange) {
      const validCurrent = await bcrypt.compare(String(currentPassword || ""), user.passwordHash);
      if (!validCurrent) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.requirePasswordChange = false;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Password update failed" });
  }
};

exports.setPasswordWithToken = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: "token and newPassword are required" });
    }
    if (!passwordPolicyValid(newPassword)) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 chars and include letters and numbers" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.type !== "password_setup" || !decoded?.userId) {
      return res.status(400).json({ error: "Invalid setup token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.accountStatus === "pendingApproval") {
      return res.status(403).json({ error: "Doctor account is pending admin approval" });
    }
    if (user.accountStatus === "rejected") {
      return res.status(403).json({ error: "Doctor request was rejected" });
    }
    if (user.accountStatus === "suspended") {
      return res.status(403).json({ error: "Account suspended. Contact support." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.requirePasswordChange = false;
    await user.save();

    return res.status(200).json({ message: "Password set successfully. You can now log in." });
  } catch (err) {
    return res.status(400).json({ error: "Invalid or expired setup link" });
  }
};

exports.getPendingDoctorRequests = async (req, res) => {
  try {
    if (!adminOnly(req, res)) return;
    const requests = await User.find({
      role: "doctor",
      accountStatus: "pendingApproval",
    }).select(
      "username email specialization experience availableDays availableTime facilityIds createdAt accountStatus doctorVerification"
    );
    return res.status(200).json({ items: requests });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch doctor requests" });
  }
};

exports.approveDoctorRequest = async (req, res) => {
  try {
    if (!adminOnly(req, res)) return;
    const requestUser = await User.findById(req.params.id);
    if (!requestUser || requestUser.role !== "doctor") {
      return res.status(404).json({ error: "Doctor request not found" });
    }
    if (requestUser.accountStatus !== "pendingApproval") {
      return res.status(400).json({ error: "Doctor request is not pending approval" });
    }

    requestUser.accountStatus = "active";
    requestUser.requirePasswordChange = true;
    requestUser.approvedBy = req.user.id;
    requestUser.approvedAt = new Date();
    requestUser.reviewedAt = new Date();
    requestUser.rejectedReason = "";
    await requestUser.save();

    const setupToken = createSetupToken(requestUser._id);
    const setupLink = `${getFrontendBase()}/force-password-change?token=${encodeURIComponent(setupToken)}`;
    const html = emailTemplate.appointmentCardTemplate(
      "Doctor Request Approved",
      `<p>Hello Dr. <b>${requestUser.username}</b>,</p><p>Your request has been approved by admin. Please set your account password to activate doctor login access.</p><p>This link expires in 24 hours.</p>`,
      "Set Password",
      setupLink
    );
    await sendEmail(requestUser.email, "Medico doctor request approved", "", html);

    return res.status(200).json({
      message: "Doctor request approved",
      userId: requestUser._id,
      requirePasswordChange: true,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to approve doctor request" });
  }
};

exports.rejectDoctorRequest = async (req, res) => {
  try {
    if (!adminOnly(req, res)) return;
    const requestUser = await User.findById(req.params.id);
    if (!requestUser || requestUser.role !== "doctor") {
      return res.status(404).json({ error: "Doctor request not found" });
    }
    if (requestUser.accountStatus !== "pendingApproval") {
      return res.status(400).json({ error: "Doctor request is not pending approval" });
    }

    const reason = String(req.body?.reason || "").trim();
    requestUser.accountStatus = "rejected";
    requestUser.reviewedAt = new Date();
    requestUser.approvedBy = req.user.id;
    requestUser.rejectedReason = reason;
    await requestUser.save();

    return res.status(200).json({ message: "Doctor request rejected" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to reject doctor request" });
  }
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
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const roleForLogin = getRoleForEmail(normalizedEmail);
      user = await User.create({
        email: normalizedEmail,
        username: name,
        profileImage: picture,
        role: roleForLogin,
        googleAccessToken: googleId,
        accountStatus: "active",
      });
    } else {
      if (!user.googleAccessToken) {
        user.googleAccessToken = googleId;
      }
      await user.save();
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    return setSessionCookies(res, accessToken, refreshToken)
      .status(200)
      .json(buildAuthResponse(user, accessToken));
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

    const newAccessToken = signAccessToken(user);
    res.cookie("accessToken", newAccessToken, getCookieOptions(ACCESS_COOKIE_AGE_MS));

        const tokenData = jwt.verify(newAccessToken, process.env.JWT_SECRET);

    res.status(200).json({
      message: "Token refreshed",
      token: tokenData,
      requirePasswordChange: Boolean(user.requirePasswordChange),
      accountStatus: user.accountStatus,
    });
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
      res.status(200).json({
        message: "Token valid",
        token: tokenData,
        user,
        requirePasswordChange: Boolean(user.requirePasswordChange),
        accountStatus: user.accountStatus,
      });
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
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const roleForLogin = getRoleForEmail(normalizedEmail);
      user = await User.create({
        email: normalizedEmail,
        username: name,
        profileImage: picture,
        role: roleForLogin,
        googleAccessToken: tokens.access_token || googleId,
        accountStatus: "active",
      });
    } else {
      if (!user.googleAccessToken) {
        user.googleAccessToken = tokens.access_token || googleId;
      }
      await user.save();
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    res
      .clearCookie("google_oauth_state")
      .cookie("accessToken", accessToken, getCookieOptions(ACCESS_COOKIE_AGE_MS))
      .cookie("refreshToken", refreshToken, getCookieOptions(REFRESH_COOKIE_AGE_MS))
      .redirect(`${frontendUrl}/`);
  } catch (err) {
    console.error("Google callback error:", err?.response?.data || err?.message || err);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    res.redirect(`${frontendUrl}/login?error=google_login_failed`);
  }
};
