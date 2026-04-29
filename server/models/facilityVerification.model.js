const mongoose = require('mongoose');

const facilityVerificationSchema = new mongoose.Schema({
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },

  comments: {
    type: String,
    trim: true,
  },

  reviewedAt: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FacilityVerification', facilityVerificationSchema);
