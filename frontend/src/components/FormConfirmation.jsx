import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
  Paper,
} from "@mui/material";
import  { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomLoader from "../components/Utility/CustomLoader";
import { fetchAppointments } from "../store/slices/appointmentSlice";
import { useDispatch, useSelector } from "react-redux";

const FormConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
    const { list: bookingData, loading } = useSelector((state) => state.appointments);

  useEffect(() => {
    if (!id) {
      console.warn("ID is not available yet.");
      return;
    }

    dispatch(fetchAppointments({ path: id }));

  }, [dispatch,id]);

  const goToHome = () => {
    navigate("/");
  };

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 3,
        mb: 6,
        px: 3,
        py: 4,
        borderRadius: "8px",
        padding: "15px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
        Your request has been submitted
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 4 }}>
        Your appointment request has been successfully submitted. You will
        receive a notification once your request is processed.
      </Typography>

      <Paper elevation={0} sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
          Request Summary
        </Typography>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Hospital Name</TableCell>
              <TableCell>{bookingData?.facilityId?.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Doctor's Name</TableCell>
              <TableCell>{bookingData?.doctorId?.username}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Scheduled Date</TableCell>
              <TableCell>{bookingData?.date?.split("T")[0]}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Time</TableCell>
              <TableCell>
                {`${bookingData?.timeSlot?.start} - ${bookingData?.timeSlot?.end}`}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Reason</TableCell>
              <TableCell>{bookingData?.reason}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
              <TableCell>{bookingData?.status}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Box display="flex" justifyContent="center" gap={2}>
        <Button variant="contained" onClick={goToHome}>
          Go to Home
        </Button>
      </Box>
    </Box>
  );
};

export default FormConfirmation;
