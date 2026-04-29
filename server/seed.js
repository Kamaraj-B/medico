// seed.js
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Facility = require('./models/facility.model');

mongoose.connect('mongodb://localhost:27017/medico', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ---------- Helper functions ----------
function getRandomCoord(center, delta = 0.05) {
  return {
    lat: +(center.lat + (Math.random() - 0.5) * delta).toFixed(6),
    lng: +(center.lng + (Math.random() - 0.5) * delta).toFixed(6),
  };
}

function getRandomDays() {
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const count = Math.floor(Math.random() * 4) + 3; // 3–6 days
  const shuffled = [...allDays].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).sort((a, b) => allDays.indexOf(a) - allDays.indexOf(b));
}

function getRandomAvailableTime() {
  return {
    day: `${String(Math.floor(Math.random() * 4) + 8).padStart(2, '0')}:00-${String(Math.floor(Math.random() * 4) + 12).padStart(2, '0')}:00`,
    night: `${String(Math.floor(Math.random() * 4) + 16).padStart(2, '0')}:00-${String(Math.floor(Math.random() * 4) + 20).padStart(2, '0')}:00`
  };
}

function getDoctorAvailabilityMap(days) {
  const map = {};
  days.forEach(day => {
    map[day] = getRandomAvailableTime();
  });
  return map;
}

// City centers
const cities = [
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { name: 'Trichy', lat: 10.7905, lng: 78.7047 },
];

// ---------- Seed Data ----------
const users = [
  { username: 'Alice Smith', email: 'alice@example.com', password: '123456', mobile: '9876543211', role: 'doctor', specialization: 'Cardiology', experience: 5 },
  { username: 'Emma Watson', email: 'emma@example.com', password: '123456', mobile: '9876543213', role: 'doctor', specialization: 'Neurology', experience: 8 },
  { username: 'David Kim', email: 'david@example.com', password: '123456', mobile: '9876543216', role: 'doctor', specialization: 'Orthopedics', experience: 10 },
  { username: 'Sophie Turner', email: 'sophie@example.com', password: '123456', mobile: '9876543217', role: 'pharmacyOwner' },
  { username: 'Noah Black', email: 'noah@example.com', password: '123456', mobile: '9876543224', role: 'pharmacyOwner' },
  { username: 'Kamaraj B', email: 'kamarajbalakrishnan08@gmail.com', password: '123456', mobile: '8903921051', role: 'user' },
  { username: 'Bala', email: 'kamarajb465@gmail.com', password: '123456', mobile: '8098364652', role: 'admin' },
];

// ---------- Seeding Function ----------
async function seed() {
  try {
    await User.deleteMany({});
    await Facility.deleteMany({});

    // Populate availableDays & availableTime for doctors
    const preparedUsers = users.map(user => {
      if (user.role === 'doctor') {
        const availableDays = getRandomDays();
        return {
          ...user,
          availableDays,
          availableTime: getDoctorAvailabilityMap(availableDays)
        };
      }
      return user;
    });

    const createdUsers = await User.insertMany(preparedUsers);

    // Facilities with city + random coords + random days/times
    const facilitiesData = [
      { name: 'City Hospital', type: 'hospital', location: 'Main Street', contactNumber: '9876500001', email: 'cityhospital@example.com', isVerified: true, workingHours: '08:00-18:00', owner: createdUsers[0]._id },
      { name: 'Green Clinic', type: 'clinic', location: 'Park Avenue', contactNumber: '9876500002', email: 'greenclinic@example.com', isVerified: false, workingHours: '10:00-20:00', owner: createdUsers[1]._id },
      { name: 'Sunrise Pharmacy', type: 'pharmacy', location: 'Sunset Boulevard', contactNumber: '9876500003', email: 'sunrisepharmacy@example.com', isVerified: true, workingHours: '00:00-23:59', owner: createdUsers[3]._id },
      { name: 'MediCare Clinic', type: 'clinic', location: 'Hilltop Street', contactNumber: '9876500004', email: 'medicare@example.com', isVerified: false, workingHours: '09:00-17:00', owner: createdUsers[4]._id },
      { name: 'Wellness Hospital', type: 'hospital', location: 'Well Street', contactNumber: '9876500005', email: 'wellness@example.com', isVerified: true, workingHours: '07:00-19:00', owner: createdUsers[6]._id },
      { name: 'Express Pharmacy', type: 'pharmacy', location: 'Downtown Plaza', contactNumber: '9876500006', email: 'expresspharmacy@example.com', isVerified: true, workingHours: '08:00-22:00', owner: createdUsers[3]._id },
    ].map(facility => {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const coords = getRandomCoord(city);
      const availableDays = getRandomDays();
      return {
        ...facility,
        lat: coords.lat,
        lng: coords.lng,
        availableDays,
        availableTime: getDoctorAvailabilityMap(availableDays),
        city: city.name
      };
    });

    const createdFacilities = await Facility.insertMany(facilitiesData);

    // Link facilities to owners
    for (const facility of createdFacilities) {
      await User.findByIdAndUpdate(
        facility.owner,
        { $push: { facilityIds: facility._id } },
        { new: true }
      );
    }

    console.log('✅ Database seeded successfully.');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Seeding error:', error);
    mongoose.connection.close();
  }
}

seed();
