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
    required:true
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
