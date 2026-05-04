const mongoose = require("mongoose");

const doctorTimeSlotSchema = new mongoose.Schema(
  {
    day: { type: String, default: null },
    night: { type: String, default: null },
  },
  { _id: false }
);

const personalDetailsSchema = new mongoose.Schema(
  {
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"], default: undefined },
    bloodGroup: { type: String, trim: true },
    emergencyContactName: { type: String, trim: true },
    emergencyContactNumber: { type: String, trim: true },
  },
  { _id: false }
);

const paymentDetailsSchema = new mongoose.Schema(
  {
    bank: { type: String, trim: true },
    paymentType: { type: String, enum: ["debit", "credit"], default: undefined },
    cardNumber: { type: String, trim: true },
    cardName: { type: String, trim: true },
    expiry: { type: String, trim: true },
    cvv: { type: String, trim: true },
    upiId: { type: String, trim: true },
  },
  { _id: false }
);

const doctorVerificationSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, trim: true },
    medicalCouncil: { type: String, trim: true },
    registrationYear: { type: Number, min: 1950, max: 2100 },
    degreeCategory: { type: String, enum: ["undergraduate", "postgraduate"] },
    degree: { type: String, trim: true },
    university: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },

  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
    trim: true,
  },

  mobile: {
    type: Number,
    // required: true,
    unique: true,
    sparse: true,
    match: /^\d{10}$/,
  },
  alternateMobile: {
    type: Number,
    // required: true,
    unique: true,
    sparse: true,
    match: /^\d{10}$/,
  },
  state: { type: String, trim: true },
  district: { type: String, trim: true },
  pincode: { type: String, trim: true },
  isVerified: {
    type: Boolean,
    default: false,
  },

  role: {
    type: String,
    enum: ["user", "admin", "doctor", "pharmacyOwner"],
    default: "user",
  },
  accountStatus: {
    type: String,
    enum: ["active", "pendingApproval", "rejected", "suspended"],
    default: "active",
  },
  requirePasswordChange: {
    type: Boolean,
    default: false,
  },
  passwordHash: {
    type: String,
    trim: true,
    default: "",
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  rejectedReason: {
    type: String,
    trim: true,
    default: "",
  },
  reviewedAt: {
    type: Date,
    default: null,
  },

  address: { type: String, trim: true },
  profileImage: { type: String, trim: true },
  personalDetails: {
    type: personalDetailsSchema,
    default: {},
  },
  paymentDetails: {
    type: paymentDetailsSchema,
    default: {},
  },
  doctorVerification: {
    type: doctorVerificationSchema,
    default: {},
  },

  facilityIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: function () {
        return this.role === "doctor" || this.role === "pharmacyOwner";
      },
    },
  ],

  specialization: {
    type: String,
    required: function () {
      return this.role === "doctor";
    },
  },

  experience: {
    type: Number,
    min: 0,
    required: function () {
      return this.role === "doctor";
    },
  },

  availableDays: {
    type: [String],
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: function () {
      return this.role === "doctor";
    },
  },

  availableTime: {
    type: Map,
    of: doctorTimeSlotSchema,
    required: function () {
      return this.role === "doctor";
    },
    default: {},
  },
  googleAccessToken: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", function updateTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
