import {
  Card,
  CardContent,
  Typography,
  Grid,
  CardActionArea,
  Box,
   Fab, Zoom
} from "@mui/material";
import React from "react";

const BookingCardList = ({ bookings, onSelect, selectedId }) => {
  const showDetails = !!selectedId;
  const {role} = JSON.parse(localStorage.getItem("tokenInfo"));
  return (
    <Box p={2}>
      <Grid container spacing={2}>
        {bookings.map((booking) => {
          const isSelected = selectedId === booking._id;

          return (
<Grid key={booking._id} item xs={12} sm={6} md={showDetails ? 6 : 3}>

              <Card
                sx={{
                  border: isSelected ? "2px solid #1976d2" : "1px solid #ddd",
                  boxShadow: isSelected ? "0 4px 12px rgba(25, 118, 210, 0.4)" : "0 2px 6px rgba(0,0,0,0.1)",
                  backgroundColor: isSelected ? "rgba(25, 118, 210, 0.08)" : "#fff",
                  transform: isSelected ? "scale(1.03)" : "scale(1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  height: "100%",
                }}
                onClick={() => onSelect(booking)}
              >
                 <Zoom in={true}>
        <Fab
          variant="extended"
          size="small"
          color={
            booking.status === "completed"
              ? "success"
              : booking.status === "rejected" || booking.status === "cancelled"
              ? "error"
              : "warning"
          }
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            textTransform: "none",
            fontSize: "0.75rem",
            height: 28,
            px: 1.5,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          {booking.status || "Pending"}
        </Fab>
      </Zoom>
                <CardActionArea>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {booking.facilityId.name}
                    </Typography>
                    {
                      role === "doctor" ? (
                        <Typography variant="body2">
                          Patient: {booking.userId.username}
                        </Typography>
                      ):( <Typography variant="body2">
                      Doctor: {booking.doctorId.username}
                    </Typography>)
                    }
                   
                    <Typography variant="body2">
                      Date: {booking.date.split("T")[0]} | Time:{" "}
                      {booking.timeSlot.start} - {booking.timeSlot.end}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default BookingCardList;
