import { Edit, Save, Verified, ErrorOutline } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
  Badge,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const ProfileInfo = ({ user, handleFormSubmit, handleImageUploadForm }) => {
  const isVerified = user.isVerified;
  const [isEditing, setIsEditing] = useState(false);
  const [isFieldUpdated, setIsFieldUpdated] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(user || {});

  useEffect(() => {
    setFormData(user || {});
  }, [user]);

  const splitaddress = formData.address ? formData.address.split("&") : [];

  const validateForm = () => {
    const newErrors = {};
    if (!String(formData.username || "").trim()) newErrors.username = "Name is required";
    if (!/^\d{10}$/.test(String(formData.mobile || "")))
      newErrors.mobile = "Invalid mobile number";
    if (
      String(formData.alternateMobile || "").trim() &&
      !/^\d{10}$/.test(String(formData.alternateMobile || ""))
    ) {
      newErrors.alternateMobile = "Invalid alternate mobile number";
    }
    if (
      formData.email &&
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
    }
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleImageUploadForm(file);
  };

const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    const updated = { ...prev };

    if (name.startsWith("personalDetails.")) {
      const key = name.split(".")[1];
      updated.personalDetails = {
        ...(updated.personalDetails || {}),
        [key]: value,
      };
    } else {
      updated[name] = value;
    }

    if (
      name === "addressLine1" ||
      name === "addressLine2" ||
      name === "addressLine3"
    ) {
      updated.address = [
        updated.addressLine1 || "",
        updated.addressLine2 || "",
        updated.addressLine3 || "",
      ]
        .filter(Boolean)
        .join("&");
    }

    return updated;
  });

  setIsFieldUpdated(true);
};


  const handleToggleEdit = async () => {
    if (isEditing) {
      if (isFieldUpdated) {
        if (!validateForm()) return;
        setIsFieldUpdated(false);
        handleFormSubmit(formData);
      }
    }
    setIsEditing((prev) => !prev);
  };

  return (
    <Box p={4}>
      {/* Heading */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="h4"
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Profile Information
        </Typography>

        <Tooltip title={isEditing ? "Save Changes" : "Edit"}>
          <IconButton
            color={isEditing ? "primary" : "default"}
            onClick={handleToggleEdit}
          >
            {isEditing ? <Save /> : <Edit />}
          </IconButton>
        </Tooltip>
      </Box>

      <Grid
        container
        spacing={25}
        justifyContent="center"
        alignItems="center"
        mt={2}
      >
        {/* Left Info */}
        <Grid item xs={12} md={6}>
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            alignItems="flex-start"
          >
            {isEditing ? (
              <TextField
                fullWidth
                name="username"
                label="Name"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
              />
            ) : (
              <Typography variant="subtitle1">
                <strong>Name:</strong> {user?.username || "John Doe"}
              </Typography>
            )}

            <Typography variant="subtitle1">
              <strong>Account ID:</strong> {user?._id || "USR001234"}
            </Typography>
            <Button>{user?.role || "USR001234"}</Button>
          </Box>
        </Grid>

        {/* Avatar */}
        <Grid item xs={12} md={4} textAlign="center">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <label htmlFor="avatar-upload">
                <input
                  type="file"
                  accept="image/*"
                  id="avatar-upload"
                  hidden
                  onChange={handleImageUpload}
                />
                <IconButton component="span" sx={{ bgcolor: "#fff" }}>
                  <Edit />
                </IconButton>
              </label>
            }
          >
            <Avatar
              alt="User Avatar"
              src={user?.profileImage || ""}
              sx={{ width: 120, height: 120, margin: "0 auto" }}
            />
          </Badge>

          {/* Verified Status */}
          <Box mt={1}>
            {isVerified ? (
              <Typography
                color="green"
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
              >
                <Verified color="success" /> Verified
              </Typography>
            ) : (
              <Tooltip title="Click to Verify your account">
                <IconButton color="error">
                  <ErrorOutline />
                  <span style={{ fontSize: "15px", marginLeft: "4px" }}>
                    Not Verified
                  </span>
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box
        mt={4}
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Typography
          variant="body1"
          gutterBottom
          sx={{ textAlign: "left", fontWeight: "bold", my: 2 }}
        >
          Contact Details
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <Box>
            <TextField
              fullWidth
              name="mobile"
              label="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              InputProps={{ readOnly: !isEditing }}
               error={!!errors.mobile}
                helperText={errors.mobile}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              name="alternateMobile"
              label="Alternate Mobile Number"
              value={formData.alternateMobile}
              onChange={handleChange}
              InputProps={{ readOnly: !isEditing }}
               error={!!errors.alternateMobile}
                helperText={errors.alternateMobile}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{ readOnly: !isEditing }}
               error={!!errors.email}
                helperText={errors.email}
            />
          </Box>
        </Box>

        <Typography
          variant="body1"
          gutterBottom
          sx={{ textAlign: "left", fontWeight: "bold", my: 2 }}
        >
          Personal Details
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <Box>
            <TextField
              fullWidth
              name="personalDetails.dob"
              label="DOB"
              type="date"
              value={formData.personalDetails?.dob || ""}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: !isEditing }}
            />
          </Box>
          <Box>
            {isEditing ? (
              <FormControl fullWidth>
                <InputLabel id="gender-label" shrink>
                  Gender
                </InputLabel>
                <Select
                  labelId="gender-label"
                  name="personalDetails.gender"
                  value={formData.personalDetails?.gender || ""}
                  label="Gender"
                  onChange={handleChange}
                  displayEmpty
                  renderValue={(selected) => selected || "Select Gender"}
                >
                  <MenuItem value="">
                    <em>Select Gender</em>
                  </MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField
                fullWidth
                label="Gender"
                value={formData.personalDetails?.gender || "-"}
                InputProps={{ readOnly: true }}
              />
            )}
          </Box>
          <Box>
            {isEditing ? (
              <FormControl fullWidth>
                <InputLabel id="blood-group-label" shrink>
                  Blood Group
                </InputLabel>
                <Select
                  labelId="blood-group-label"
                  name="personalDetails.bloodGroup"
                  value={formData.personalDetails?.bloodGroup || ""}
                  label="Blood Group"
                  onChange={handleChange}
                  displayEmpty
                  renderValue={(selected) => selected || "Select Blood Group"}
                >
                  <MenuItem value="">
                    <em>Select Blood Group</em>
                  </MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField
                fullWidth
                label="Blood Group"
                value={formData.personalDetails?.bloodGroup || "-"}
                InputProps={{ readOnly: true }}
              />
            )}
          </Box>
        </Box>

        <Typography
          variant="body1"
          gutterBottom
          sx={{ textAlign: "left", fontWeight: "bold", my: 2 }}
        >
          Address
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <Box>
            <TextField
              fullWidth
              name="addressLine1"
              label="Address Line 1"
              value={splitaddress[0]}
              onChange={handleChange}
              InputProps={{ readOnly: !isEditing }}
              error={!!errors.addressLine1}
                helperText={errors.addressLine1}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              name="addressLine2"
              label="Address Line 2"
              value={splitaddress[1]}
              onChange={handleChange}
              InputProps={{ readOnly: !isEditing }}
               error={!!errors.addressLine2}
                helperText={errors.addressLine2}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              name="addressLine3"
              label="Address Line 3"
              value={splitaddress[2]}
              onChange={handleChange}
              InputProps={{ readOnly: !isEditing }}
               error={!!errors.addressLine3}
                helperText={errors.addressLine3}
            />
          </Box>
        </Box>

        <Box
          mt={2}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <Box>
            <FormControl fullWidth disabled={!isEditing}>
              <InputLabel id="state-label">State</InputLabel>
              <Select
                labelId="state-label"
                name="state"
                value={formData.state}
                label="State"
                
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Select State</em>
                </MenuItem>
                <MenuItem value="TamilNadu" >Tamil Nadu</MenuItem>
                <MenuItem value="Kerala">Kerala</MenuItem>
                <MenuItem value="Karnataka">Karnataka</MenuItem>
                <MenuItem value="Andhra">Andhra</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <TextField
              fullWidth
              name="district"
              label="District"
              value={formData.district}
              onChange={handleChange}
              InputProps={{ readOnly: !isEditing }}
               error={!!errors.district}
                helperText={errors.district}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              name="pincode"
              label="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              InputProps={{ readOnly: !isEditing }}
            />
          </Box>
        </Box>

        {user?.role === "doctor" && (
          <>
            <Typography
          variant="body1"
          gutterBottom
          sx={{ textAlign: "left", fontWeight: "bold", my: 2 }}
        >
          Professional Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="specialization"
              label="Specialization"
              value={formData.specialization || ""}
              onChange={handleChange}
              InputProps={{ readOnly: !isEditing }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="experience"
              label="Experience (Years)"
              value={formData.experience || ""}
              onChange={handleChange}
              InputProps={{ readOnly: !isEditing }}
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Facilities Mapped"
              value={(formData.facilityIds || []).length}
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Available Days"
              value={(formData.availableDays || []).join(", ")}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Available Time"
              value={
                Object.keys(formData.availableTime || {}).length
                  ? "Configured"
                  : "Not configured"
              }
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ProfileInfo;
