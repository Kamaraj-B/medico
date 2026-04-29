import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Link,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const previouslybooked = [
  {
    name: "Cityville General Hospital",
    date: "2024-08-15",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA21M8XAvfYNGN5Afl_6laMk2UPCkvHFlYOkyqUOJCM5VNubxQFmLmn5QmXNOHqPh1wZyMcwVIXjlWRToQzDw_v5bJ-37wrIAV22zqo6Hdk6hKAjM3CjyZ7bYujigdC24pFp7p7jXBlmRtVY7c8yR_sXXBmoe9Mh2RlMNNgR1nUJi7Ntn_dzZ0CxlMbfOLd807Cexl4jDni33cfSnOZfu1mO-czEV02apIBq07R-rGsveKPOkwLv3cQeP7H3RM6XQyV0A3NWWzMwWIH",
  },
  {
    name: "Townsville Medical Center",
    date: "2024-07-20",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuConDN8bqV8H3UT2fQ4-EadA0LgRxkg5MMmbQDz9ESSWvtiAWhEpy87jtgbLmDc-MF5IbsyeGRqEFtkyeLP9BSkzzDTdC0m9ICC0WrCOdr40IuBo3PxQSSp00XxN1fKwIOt5c7odrSuvzI7Zk8C6bJbZ6S0YkMhMHXBUiD0QduAbaAODH2BU6cX1wX_e6UIeOY_q1Vj_YdpcLaKQ6_kXOjkty14Gz9eQOgxWPjVFutB7cfdWSQzfMbabyPYb6jPP7qJhvEw-foQb2V2",
  },
  {
    name: "Villagetown Community Clinic",
    date: "2024-06-10",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC0PU7zYbh7s3ibWqzCsTxnoOXpPzaQkXExqB10iZxLnT3zS_iMEXJo4bAEpoRafBAk9Wd9gHuv8JIwiQc6LCtrCVYw3MS51SeVHrXTw_uINkRpFrwRfb4qoGUetTeJWZ0LhI6OzoR_hrQ4AE1zBpXaaZhApLwACHEtIm0wGOMAc_V60uDXbM3pjU8ytMXSnJ6k6r5TZxMC91sDw5C5VMwVSc94rsOCSaeFiZEwfbgJHMncCIPqiTgGCswzf0MrRNw4ZVykDXe2WjCn",
  },
  {
    name: "Townsville Medical Center",
    date: "2024-04-12",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7sOV4HHBjcqnkttqoyh9dcIP5dEkv6M-dO603-WcvT1B1d_FEuNbkAt4hRJP0Hwb7SgSHVTWqLIN1N-tnmt8ryrexXuu2_8b_9dSiqZ-FEkJb2_vPf5RcqTc1M6fe5s029cItTsGDTx2fzPQoYAu57tl6Xnl7lGuv-tqvMokexjFbtqVAPz-LJ8CwTqcGNevgL1Ux68YoWENiSK9VI6fzFzD7Sdk9E_1n4lW9S3ni6eqjm90KqBVFXg9u2wJdcLc6OEyR8IyEBvyI",
  },
];

const PreviouslyBooked = () => {

  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        fontSize: "1.2rem",
        px: 4,
        py: 2,
        borderRadius: 2,
        mt: 4,
      }}
    >
      <Typography variant="h5" fontWeight={600} gutterBottom align="center">
        Previously Booked By You
      </Typography>
      <Grid container spacing={2}>
        {previouslybooked.map((hospital, index) => (
          <Grid  key={index}>
            <Card sx={{ borderRadius: 2 }}>
              <CardMedia
                component="img"
                height="140"
                image={hospital.image}
                alt={hospital.name}
              />
              <CardContent>
                <Typography variant="body1" fontWeight={600}>
                  {hospital.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Appointment on {hospital.date}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box mt={1} textAlign="right">
        <Link onClick={() => navigate("/appointments")} underline="hover" fontSize="14px" style={{ cursor: "pointer" }}>
          Click More
        </Link>
      </Box>
    </Box>
  );
};

export default PreviouslyBooked;
