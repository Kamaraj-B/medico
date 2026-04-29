const mongoose = require('mongoose');
const { Schema } = mongoose;

const appointmentSchema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facilityId: {
    type: Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    start: { type: String, required: true },
    end: { type: String, required: true }  
  },
  mode: {
    type: String,
    // Keep audio for backward compatibility, use chat for current UI.
    enum: ['in-person', 'video', 'audio', 'chat'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  calendar: {
    eventId: { type: String },
    eventLink: { type: String },
    syncStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'synced', 'failed'],
      default: 'not_applicable'
    },
    syncError: { type: String }
  }
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
