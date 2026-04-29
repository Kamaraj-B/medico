const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  day: { type: String, default: null },
  night: { type: String, default: null },
}, { _id: false });


module.exports = mongoose.model('TimeSlot',TimeSlotSchema);
