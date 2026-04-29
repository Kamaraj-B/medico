import LightModeIcon from "@mui/icons-material/LightMode";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import { Button } from "@mui/material";
import { Box } from '@mui/material';
import { Typography } from "@mui/material";
import DaysTimeSlotDisplay from "../Utility/DaysTimeSlotDisplay";
import "./InfoWindowCard.css";



const InfoWindowCard = ({ marker,onBookNow, onMoreDetails }) => {


  return (
    <div className="w-96 p-4 bg-white rounded-xl shadow-xl text-sm">
      <Typography
        variant="h6"
        textAlign="center"
        fontWeight={600}
        gutterBottom
        sx={{ mb: 1 }}
      >
        {marker.name}
      </Typography>

      <Typography variant="body2" textAlign="center" color="text.secondary" mb={2}>
        Type: <span style={{ textTransform: "capitalize" }}>{marker.type}</span>
      </Typography>

      <b>
        <p>Open's on:</p>
      </b>
      {/* Day & Time Slots */}
      
      <DaysTimeSlotDisplay
        availableDays={marker.availableDays}
        availableTimeSlots={marker.availableTimeSlots}
      />
      
      {/* Action Buttons in a Row */}
<Box
  display="flex"
  justifyContent="space-between"
  gap={2}
  p={3}
>
  <Button onClick={onMoreDetails}>More Details</Button>
  <Button onClick={onBookNow}>Book Now</Button>
</Box>
    </div>
  );
};

export default InfoWindowCard;
