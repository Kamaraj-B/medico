import {  Box } from '@mui/material';
import MapComponent from '../components/Map/MapComponent';
import PreviouslyBooked from '../components/Booking/PreviouslyBooked';
const Home = () => {
  return (
    <>
    <Box sx={{ flexGrow: 1, py: 4 }}>
    <MapComponent/>
     <PreviouslyBooked/>
    </Box>
    </>
    
  );
};

export default Home;
