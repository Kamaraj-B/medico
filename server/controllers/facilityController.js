const Facility = require('../models/facility.model');
const User = require('../models/user.model'); 
const mongoose = require('mongoose');

// Create Facility
exports.createFacility = async (req, res) => {
  try {
    const { body } = req;
    console.log('Request body:', req.user);
    const facility = new Facility({
      ...body,
      lng: body.lng ? parseFloat(body.lng) : undefined,
      lat: body.lat ? parseFloat(body.lat) : undefined,
      owner: req.user.id, 
      images: req.files?.images?.map(file => file.path) || [],
      documents: req.files?.documents?.map(file => file.path) || []
    });

    await facility.save();
    res.status(201).json({ message: 'Facility created successfully', facility });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create facility', details: error.message });
  }
};

// Update Facility
exports.updateFacility = async (req, res) => {
  try {
    const facilityId = req.params.id;
    const updates = req.body;

    // Append uploaded files if present
    if (req.files?.images) {
      updates.images = req.files.images.map(file => file.path);
    }
    if (req.files?.documents) {
      updates.documents = req.files.documents.map(file => file.path);
    }

    const updated = await Facility.findByIdAndUpdate(facilityId, updates, { new: true });

    if (!updated) return res.status(404).json({ error: 'Facility not found' });

    res.json({ message: 'Facility updated', facility: updated });
  } catch (error) {
    res.status(500).json({ error: 'Update failed', details: error.message });
  }
};

// Get all Facilities (with filters)
exports.getAllFacilities = async (req, res) => {
  try {
    const { type, city, owner, isVerified } = req.query;

    const query = {};
    if (type) query.type = type;
    if (city) query['address.city'] = city;
    if (owner) query.owner = owner;
    if (isVerified) query.verificationStatus = isVerified;

    const facilities = await Facility.find(query).populate('owner', 'name email');
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: 'Fetching failed', details: error.message });
  }
};

// Get Facility by ID
exports.getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id).populate('owner', 'name email');
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch', details: error.message });
  }
};

// Delete Facility (optional)
exports.deleteFacility = async (req, res) => {
  try {
    const result = await Facility.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Facility not found' });
    res.json({ message: 'Facility deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed', details: error.message });
  }
};


exports.getFacilityWithDoctors = async (req, res) => {
  try {
    const facilityId = req.params.id;
    const selectedDate = req.query.date; // Format: YYYY-MM-DD

    // 1. Get facility details
    const facility = await Facility.findById(facilityId).select('name _id type');
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    // 2. Get doctors associated with this facility
    const doctors = await User.find({
      role: "doctor",
      facilityIds: facilityId
    }).select("profileImage username specialization experience availableDays availableTime");


    // 4. Send combined response
    res.json({
      facility,
      doctors
    });

  } catch (error) {
    console.error("Error fetching facility and doctors:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

