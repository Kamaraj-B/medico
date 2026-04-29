
import TimeSlotSelector from "../Utility/TimeSlotSelector";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Stack,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveBooking } from "../../store/slices/bookingSlice";

const HospitalBookingForm = ({
  doctors = [],
  bookedSlots = {},
  facility,
  setLoading,
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [reason, setReason] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [mode, setMode] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
const { bookingLoading } = useSelector((state) => state.booking);


  const doctorData = doctors.find((doc) => doc._id === selectedDoctor);

  const handleSubmit = () => {
          setLoading(true);
  if (!startTime || !endTime) return;

  const payload = {
    doctorId: selectedDoctor,
    facilityId: facility._id,
    reason,
    date: selectedDate,
    timeSlot: { start: startTime, end: endTime },
    mode,
  };

  dispatch(saveBooking(payload))
    .unwrap()
    .then((data) => {
      setLoading(bookingLoading)
      navigate(`/success/${data._id}`);
    })
    .catch((err) => {
      console.error("Booking failed:", err);
    });
};

  return (
    <Box
      component="form"
      sx={{
        px: { xs: 2, sm: 4, md: 6 },
        py: 4,
        width: "450px",
        maxWidth: "100%",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Book Appointment
      </Typography>

      <TextField
        label="Hospital Name"
        value={facility.name}
        variant="outlined"
        
        InputProps={{
          readOnly: true,
        }}
      />

      <FormControl fullWidth>
        <InputLabel>Select Doctor</InputLabel>
        <Select
          value={selectedDoctor}
          label="Select Doctor"
          onChange={(e) => {
            setSelectedDoctor(e.target.value);
            setSelectedDate(null);
            setStartTime("");
            setEndTime("");
          }}
        >
          {doctors.map((doc) => (
            <MenuItem key={doc._id} value={doc._id}>
              {doc.username}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedDoctor && (
        <Stack spacing={3}>
          <TextField
            label="Reason for Appointment"
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <TimeSlotSelector
            availableDays={doctorData?.availableDays || []}
            availableTime={doctorData?.availableTime || {}}
            bookedSlots={bookedSlots}
            onSelectionChange={({ date, start, end }) => {
              setSelectedDate(date);
              setStartTime(start);
              setEndTime(end);
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Mode</InputLabel>
            <Select
              value={mode}
              label="Mode"
              onChange={(e) => setMode(e.target.value)}
            >
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="chat">Chat</MenuItem>
              <MenuItem value="in-person">In Person</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!startTime || !endTime}
          >
            Book Appointment
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default HospitalBookingForm;
