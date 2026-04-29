import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Stack,
  Box,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import PhoneIcon from '@mui/icons-material/Phone';
import DaysTimeSlotDisplay from './Utility/DaysTimeSlotDisplay';

const toDisplaySlots = (doctor) => {
  // Prefer canonical doctor availability map, fallback to legacy fields.
  const source = doctor.availableTime || doctor.availableTimeSlots || {};
  const normalized = {};
  Object.entries(source).forEach(([day, slot]) => {
    if (!slot) return;
    if (typeof slot.day === "string") {
      const [start, end] = slot.day.split("-");
      normalized[day] = {
        ...(normalized[day] || {}),
        day: { start, end },
      };
    } else if (slot.day?.start && slot.day?.end) {
      normalized[day] = {
        ...(normalized[day] || {}),
        day: slot.day,
      };
    }
    if (typeof slot.night === "string") {
      const [start, end] = slot.night.split("-");
      normalized[day] = {
        ...(normalized[day] || {}),
        night: { start, end },
      };
    } else if (slot.night?.start && slot.night?.end) {
      normalized[day] = {
        ...(normalized[day] || {}),
        night: slot.night,
      };
    }
  });
  return normalized;
};

const DoctorCardList = ({ doctors }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', overflowY: 'auto',maxHeight: '74vh'}} className="hide-scrollbar">
    <Typography variant="h6" gutterBottom sx={{ padding: 2 }}>
      Available Doctors
    </Typography>

    {/* Scrollable list container */}
    <Box
      sx={{
       
        pr: 1,
        pl: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
      
    >
      {doctors.map((doctor) => (
        <Card
          key={doctor.id || doctor.username}
          sx={{ display: 'flex', alignItems: 'center', p: 2 }}
        >
          <CardMedia
            component="img"
            image={doctor.profileImage}
            alt={doctor.username}
            sx={{ width: 64, height: 64, borderRadius: '50%', mr: 2 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {doctor.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {doctor.specialization} • {doctor.experience} years
            </Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <IconButton color="primary" title="Audio">
                <PhoneIcon />
              </IconButton>
              <IconButton color="secondary" title="Video">
                <VideoCallIcon />
              </IconButton>
              <IconButton color="primary" title="Chat">
                <ChatIcon />
              </IconButton>
            </Stack>
          </Box>

          <DaysTimeSlotDisplay
            availableDays={doctor.availableDays}
            availableTimeSlots={toDisplaySlots(doctor)}
          />
        </Card>
      ))}
    </Box>
  </Box>
);

export default DoctorCardList;
