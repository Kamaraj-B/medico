import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Save } from "@mui/icons-material";
import {  styled } from "@mui/system";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const CardContainer = styled("div")({
  height: "50mm",
  width: "84mm",
  perspective: "800px",
  marginBottom: "2rem",
});

const CardSide = styled("div")(({ back }) => ({
  width: "100%",
  height: "100%",
  borderRadius: "3.18mm",
  position: "absolute",
  top: 0,
  left: 0,
  backfaceVisibility: "hidden",
  transition: "transform 0.7s ease-out",
  cursor: "pointer",
  padding: "10px",
  color: back ? "#eee" : "#fff",
  background: back
    ? "linear-gradient(-90deg, rgb(0, 0, 0) 0%, #242424 100%)"
    : "linear-gradient(90deg, rgb(0, 0, 0) 0%, #242424 100%)",
  transform: back ? "rotateY(-180deg)" : "rotateY(0deg)",
}));

const Flex1 = styled("div")({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
});

const Flex2 = styled("div")({
  height: "50%",
  display: "flex",
  flexDirection: "row",
});

const Card = styled("div")({
  position: "relative",
  height: "100%",
  width: "100%",
  "&:hover .cardFront": {
    transform: "rotateY(180deg)",
  },
  "&:hover .cardBack": {
    transform: "rotateY(0deg)",
  },
});

const Chip = styled("div")({
  width: "1.3cm",
  height: "1cm",
  backgroundColor: "rgb(226, 175, 35)",
  borderRadius: "8px",
  marginLeft: "22px",
  marginTop: "-35px",
});

const Photo = styled("div")({
  width: "1.4cm",
  height: "1.4cm",
  background: "grey",
  borderRadius: "8%",
  position: "absolute",
  left: "12px",
  bottom: "15px",
});

const Debit = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "1.8cm",
  height: "1cm",
  borderRadius: "1cm",
  background: "#c0c0c0",
  position: "absolute",
  right: "12px",
  bottom: "25px",
  fontFamily: "Inter",
  color: "#666",
});

const PaymentMethodImage = styled("img")(({ disabled }) => ({
  height: 40,
  marginRight: 12,
  opacity: disabled ? 0.3 : 1,
  filter: disabled ? "grayscale(100%)" : "none",
}));

export default function PaymentDetails({ paymentDetails }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(paymentDetails || {});

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleEdit = () => setIsEditing((prev) => !prev);

  return (
    <Box display="flex" flexWrap="wrap" gap={4}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box style={{display: "flex", flexDirection:"row"}}>
          <CardContainer>
            <Card style={{ marginTop: "1px" }}>
              <CardSide className="cardFront">
                <Flex1>
                  <Typography sx={{ ml: 1, fontWeight: 500, fontSize: "22px", position: "relative" }}>
                    {formData?.bank || "BANK NAME"}
                    <Box component="span" sx={{ fontSize: "6px", color: "#635c77", position: "absolute", top: "105%", left: "21%" }}>
                      Universal Bank
                    </Box>
                    <Box component="span" sx={{ color: "#635c77", position: "absolute", top: 0, right: 0 }}>
                      ₴
                    </Box>
                  </Typography>
                  <Chip />
                  <Typography sx={{ textTransform: "uppercase", fontFamily: "Roboto Mono", fontSize: "14px", mb: "10px", ml: "20px", position: "relative" }}>
                    {formData?.cardName || "CARDHOLDER NAME"}
                    <Box sx={{ position: "absolute", width: "45px", aspectRatio: "1 / 1", background: "red", borderRadius: "50%", bottom: "-10px", right: "0px" }} />
                    <Box sx={{ position: "absolute", width: "45px", aspectRatio: "1 / 1", background: "orange", borderRadius: "50%", bottom: "-10px", right: "23px" }} />
                  </Typography>
                </Flex1>
              </CardSide>

              <CardSide className="cardBack" back>
                <Box sx={{ background: "black", width: "100%", height: "50px", borderRadius: "3.18mm 3.18mm 0 0", position: "absolute", top: 0, right: 0 }} />
                <Typography sx={{ fontSize: "18px", mt: "45px", ml: "10px", fontFamily: "Roboto Mono" }}> {formData?.cardNumber || "XXXX XXXX XXXX XXXX"}</Typography>
                <Flex2>
                  <Typography sx={{ fontSize: "12px", fontFamily: "Roboto Mono", ml: 1, position: "relative" }}>{formData?.expiry || "XX/XX"}</Typography>
                  <Typography sx={{ fontSize: "12px", fontFamily: "Roboto Mono", ml: 2, position: "relative" }}>{formData?.cvv || "XXX"}</Typography>
                  <Photo />
                  <Debit>{formData?.paymentType || "debit"}</Debit>
                </Flex2>
                <Typography sx={{ fontSize: "4px", color: "#635c77", textAlign: "center", position: "absolute", bottom: "10px", left: "38px", fontFamily: "Roboto Mono" }}>
                  MONOBANK.UA | 0 800 205 205 | АТ "УНІВЕРСАЛ БАНК". ЛІЦЕНЗІЯ НБУ №92 ВІД 20.01.1994 | PCE PC100650 WORLD DEBIT
                </Typography>
              </CardSide>
            </Card>
          </CardContainer>

          {/* UPI Options */}
          <Box display="flex" justifyContent="center" gap={2} mt={10} ml={10}>
            {[
              { name: "Google Pay", src: "/gpay.png" },
              { name: "PhonePe", src: "/phonepe.png" },
              { name: "CRED", src: "/cred.png" },
              { name: "Paytm", src: "/paytm.png" },
            ].map((item) => (
              <PaymentMethodImage key={item.name} src={item.src} alt={item.name} disabled />
            ))}
          </Box>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Box flex={1} mt={2} position="relative">
          <Typography variant="h6" gutterBottom sx={{ margin: "10px" }}>
            Enter Payment Details
            {!isEditing ? (
              <IconButton size="small" onClick={toggleEdit} sx={{ float: "right" }}>
                <Edit fontSize="small" />
              </IconButton>
            ) : (
              <IconButton size="small" onClick={toggleEdit} sx={{ float: "right" }}>
                <Save fontSize="small" color="primary" />
              </IconButton>
            )}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Bank Name" name="bank" variant="outlined" value={formData.bank || ""} onChange={handleChange} InputProps={{ readOnly: !isEditing }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth style={{ width: "208px" }}>
                <InputLabel id="payment-type-label">Payment Type</InputLabel>
                <Select
                  labelId="payment-type-label"
                  id="payment-type"
                  name="paymentType"
                  value={formData.paymentType || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <MenuItem value="debit">Debit</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Card Number" name="cardNumber" variant="outlined" value={formData.cardNumber || ""} onChange={handleChange} InputProps={{ readOnly: !isEditing }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Card Holder Name" name="cardName" variant="outlined" value={formData.cardName || ""} onChange={handleChange} InputProps={{ readOnly: !isEditing }} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth label="Expiry Date" name="expiry" variant="outlined" placeholder="MM/YY" value={formData.expiry || ""} onChange={handleChange} InputProps={{ readOnly: !isEditing }} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth label="CVV" name="cvv" variant="outlined" type="password" value={formData.cvv || ""} onChange={handleChange} InputProps={{ readOnly: !isEditing }} />
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </Box>
  );
}
