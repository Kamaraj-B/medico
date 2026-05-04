const { add } = require("winston");
const User = require("../models/user.model");
const verifyGoogleToken = require("../utils/verifyGoogleToken");
const bcrypt = require("bcryptjs");

const normalizeOptionalMobile = (value) => {
  if (value === undefined || value === null) return undefined;
  const str = String(value).trim();
  if (!str) return undefined;
  return Number(str);
};

const defaultDoctorAvailability = (days = []) => {
  const map = {};
  days.forEach((day) => {
    map[day] = {
      day: "09:00-13:00",
      night: "17:00-20:00",
    };
  });
  return map;
};

// 1. Google Sign-in: Add or Login
exports.googleSignIn = async (req, res) => {
  const { token } = req.body;
  try {
    const { name, email, avatar } = await verifyGoogleToken(token);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, avatar });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Invalid Google token" });
  }
};

// 2. Get All Users
exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

// 3. Get Single User
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

// 4. Update User
exports.updateUser = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const userId = isAdmin ? req.params.id : req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const updatedUser = {
      username: req.body.username,
      email: req.body.email ? String(req.body.email).trim().toLowerCase() : undefined,
      mobile: normalizeOptionalMobile(req.body.mobile),
      alternateMobile: normalizeOptionalMobile(req.body.alternateMobile),
      address: req.body.address,
      state: req.body.state,
      district: req.body.district,
      pincode: req.body.pincode,
      role: isAdmin && req.body.role ? req.body.role : undefined,
      specialization: req.body.specialization,
      experience: req.body.experience,
      availableDays: req.body.availableDays,
      availableTime: req.body.availableTime,
      facilityIds: req.body.facilityIds,
      isVerified: req.body.isVerified,
      profileImage: req.body.profileImage,
      personalDetails: req.body.personalDetails,
      paymentDetails: req.body.paymentDetails,
    };

    Object.keys(updatedUser).forEach((key) => {
      if (updatedUser[key] === undefined) delete updatedUser[key];
    });

    const unsetFields = {};
    if (
      Object.prototype.hasOwnProperty.call(req.body, "mobile") &&
      normalizeOptionalMobile(req.body.mobile) === undefined
    ) {
      unsetFields.mobile = 1;
    }
    if (
      Object.prototype.hasOwnProperty.call(req.body, "alternateMobile") &&
      normalizeOptionalMobile(req.body.alternateMobile) === undefined
    ) {
      unsetFields.alternateMobile = 1;
    }

    if (
      updatedUser.role === "doctor" &&
      !updatedUser.availableTime &&
      Array.isArray(updatedUser.availableDays) &&
      updatedUser.availableDays.length
    ) {
      updatedUser.availableTime = defaultDoctorAvailability(updatedUser.availableDays);
    }

    const updateDoc = { $set: updatedUser };
    if (Object.keys(unsetFields).length) {
      updateDoc.$unset = unsetFields;
    }

    const user = await User.findByIdAndUpdate(userId, updateDoc, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server Error" });
  }
};

// 5. Delete User
exports.deleteUser = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Only admin can delete users" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Server Error" });
  }
};

// 6. update profile

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    
    // If file uploaded, access it via req.file
    let profileImagePath = null;

const uploadedFile = req.file || (req.files?.profile?.[0] ?? null);

if (uploadedFile) {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  profileImagePath = `${baseUrl}/uploads/profiles/${uploadedFile.filename}`;
}

    // Simulated DB update example
    const updatedUser = {
      profileImage: profileImagePath,
    };

    const user = await User.findByIdAndUpdate(userId, updatedUser, {
      new: true,
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server Error" });
  }
};

//7. create new user
exports.createUser = async (req, res) => {  
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Only admin can create users" });
    }

    const {
      username,
      email,
      mobile,
      role,
      specialization,
      experience,
      availableDays,
      availableTime,
      facilityIds,
      profileImage,
      isVerified,
      address,
      state,
      district,
      pincode,
      alternateMobile,
      personalDetails,
      paymentDetails,
    } = req.body;

    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!username || !normalizedEmail) {
      return res.status(400).json({ error: "username and email are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    } else {
      const normalizedMobile = normalizeOptionalMobile(mobile);
      const normalizedAlternateMobile = normalizeOptionalMobile(alternateMobile);
      const userPayload = {
        username,
        email: normalizedEmail,
        role: role || "user",
        accountStatus: "active",
        requirePasswordChange: false,
        specialization,
        experience,
        availableDays,
        availableTime:
          availableTime ||
          (role === "doctor" ? defaultDoctorAvailability(availableDays || []) : undefined),
        facilityIds,
        profileImage,
        isVerified,
        address,
        state,
        district,
        pincode,
        personalDetails,
        paymentDetails,
        // Required by schema; manual users do not have OAuth token.
        googleAccessToken: `manual-${Date.now()}`,
      };
      let temporaryPassword = "";
      if ((role || "user") === "doctor") {
        temporaryPassword = `Doc${Math.random().toString(36).slice(2, 8)}9`;
        userPayload.passwordHash = await bcrypt.hash(temporaryPassword, 12);
        userPayload.requirePasswordChange = true;
      }
      if (normalizedMobile !== undefined) userPayload.mobile = normalizedMobile;
      if (normalizedAlternateMobile !== undefined)
        userPayload.alternateMobile = normalizedAlternateMobile;

      const user = await User.create(userPayload);
      return res.status(201).json({
        message: "User created successfully",
        user,
        temporaryPassword: temporaryPassword || undefined,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server Error" });
  }
};