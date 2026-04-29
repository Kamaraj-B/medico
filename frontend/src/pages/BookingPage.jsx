import {
  Grid,
  Paper,
  Box,
  useTheme,
  useMediaQuery as muiUseMediaQuery,
  IconButton,
} from "@mui/material";
import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

import HospitalBookingForm from "../components/Booking/HospitalBookingForm";
import DoctorCardList from "../components/DoctorCardList";
import CustomLoader from "../components/Utility/CustomLoader";
import Modal from "../components/Utility/Modal";
import dayjs from "dayjs";


import { useDispatch, useSelector } from "react-redux";
import {
  fetchFacilityWithDoctors,
  clearBookingData,
} from "../store/slices/bookingSlice";
import { fetchAppointments } from "../store/slices/appointmentSlice";

// appointments = response from backend
const structureBookedSlots = (appointments) => {
  const result = {};

  appointments.forEach((app) => {
    if (["scheduled", "pending", "completed"].includes(app.status)) {
      const date = dayjs(app.date).format("YYYY-MM-DD");
      if (!result[date]) result[date] = { day: [], night: [] };

      // Decide if it's day or night slot
      const hour = parseInt(app.timeSlot.start.split(":")[0], 10);
      const period = hour < 18 ? "day" : "night";

      result[date][period].push(`${app.timeSlot.start}-${app.timeSlot.end}`);
    }
  });

  return result;
};


const BookingPage = () => {
  const theme = useTheme();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const isMobile = muiUseMediaQuery(theme.breakpoints.down("sm"));

  const dispatch = useDispatch();
  const { facility, doctors } = useSelector((state) => state.booking);
  const { list: appointments } = useSelector((state) => state.appointments
  );
  const bookedSlots = structureBookedSlots(appointments);

  // Fetch facility + doctors via thunk
  useEffect(() => {
    if (!id) return;
    dispatch(fetchFacilityWithDoctors(id));
    dispatch(fetchAppointments());

    return () => {
      dispatch(clearBookingData());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <Modal
        open={loading}
        onClose={() => {}}
        title="Thanks for your patience"
        showActions={false}
      >
        <CustomLoader />
      </Modal>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "#f5f5f5",
        minHeight: "90vh",
        boxSizing: "border-box",
        margin: "5px",
        borderRadius: "8px",
      }}
    >
      {/* Back Button */}
      <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-start" }}>
        <IconButton color="primary" aria-label="Back" onClick={() => window.history.back()}>
          <NavigateBeforeIcon />
        </IconButton>
      </Grid>

      <Grid
        sx={{ display: "grid", gap: 1, gridTemplateColumns: "repeat(2, 1fr)" }}
        className="hide-scrollbar"
      >
        {/* Booking Form */}
        <Grid item xs={12} md={12}>
          <Paper
            elevation={3}
            sx={{
              height: isMobile ? "auto" : "80vh",
              overflow: "auto",
              p: 2,
              boxSizing: "border-box",
            }}
            className="hide-scrollbar"
          >
            <HospitalBookingForm
              facility={facility}
              doctors={doctors}
              bookedSlots={bookedSlots}
              setLoading={setLoading}
            />
          </Paper>
        </Grid>

        {/* Doctor Cards */}
        <Grid item xs={12} md={3.6}>
          <Paper
            elevation={3}
            sx={{
              height: isMobile ? "auto" : "80vh",
              overflow: "auto",
              p: 2,
              boxSizing: "border-box",
            }}
          >
            <DoctorCardList doctors={doctors} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingPage;
