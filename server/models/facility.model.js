const mongoose = require("mongoose");

const slotDetailSchema = new mongoose.Schema(
  {
    start: { type: String }, 
    end: { type: String },
  },
  { _id: false }
);

const timeSlotSchema = new mongoose.Schema(
  {
    day: slotDetailSchema,
    night: slotDetailSchema,
  },
  { _id: false }
);

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  type: {
    type: String,
    enum: ["hospital", "clinic", "pharmacy"],
    required: true,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  address: {
    line1: { type: String, required: false },
    line2: { type: String },
    city: { type: String, required: false },
    state: { type: String, required: false },
    country: { type: String, required: false },
    pincode: { type: String, required: false },
  },

  lat: { type: Number, required: true },
  lng: { type: Number, required: true },

  clinicId: { type: String, trim: true, sparse: true },
  licenseId: { type: String, trim: true, sparse: true },
  gstId: { type: String, trim: true, sparse: true },

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
    default: [],
  },

  availableTimeSlots: {
    type: Map,
    of: timeSlotSchema,
    default: {},
  },

  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  images: [String], // URLs or file paths
  documents: [String],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

facilitySchema.index({ type: 1 });
facilitySchema.index({ verificationStatus: 1 });
facilitySchema.index({ "address.city": 1 });
facilitySchema.index({ owner: 1 });

module.exports = mongoose.model("Facility", facilitySchema);
