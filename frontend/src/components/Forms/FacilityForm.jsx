import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Box,
  Typography,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Formik, Form, FieldArray } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const steps = [
  "Facility Details",
  "Address",
  "Location",
  "Time Slots",
  "Documents",
];

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  type: Yup.string()
    .oneOf(["hospital", "clinic", "pharmacy"])
    .required("Required"),
  address: Yup.object().shape({
    line1: Yup.string().required("Required"),
    city: Yup.string().required("Required"),
    state: Yup.string().required("Required"),
    country: Yup.string().required("Required"),
    pincode: Yup.string().required("Required"),
  }),
  lat: Yup.number().required("Required"),
  lng: Yup.number().required("Required"),
  availableDays: Yup.array().of(Yup.string().oneOf(daysOfWeek)),
});

const defaultInitialValues = {
  name: "",
  type: "",
  owner: "",
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  },
  lat: "",
  lng: "",
  clinicId: "",
  licenseId: "",
  gstId: "",
  availableDays: [],
  availableTimeSlots: {},
  verificationStatus: "pending",
  images: [],
  documents: [],
};


const FacilityForm = ({ open, handleClose, onSubmit, initialData = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const isLastStep = activeStep === steps.length - 1;
  const formInitialValues = {
    ...defaultInitialValues,
    ...initialData,
    address: {
      ...defaultInitialValues.address,
      ...(initialData?.address || {}),
    },
    availableDays: initialData?.availableDays || [],
    availableTimeSlots: initialData?.availableTimeSlots || {},
    images: initialData?.images || [],
    documents: initialData?.documents || [],
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>Add/Edit Facility</DialogTitle>

      <Formik
        initialValues={formInitialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={(values, actions) => {
          onSubmit(values);
          actions.setSubmitting(false);
          handleClose();
        }}
      >
        {({
          values,
          handleChange,
          errors,
          touched,
          setFieldValue,
          isSubmitting,
        }) => (
          <Form>
            <DialogContent dividers>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Grid container spacing={2}>
                {activeStep === 0 && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Name"
                        name="name"
                        fullWidth
                        value={values.name}
                        onChange={handleChange}
                        error={touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl
                        fullWidth
                        error={touched.type && !!errors.type}
                      >
                        <InputLabel>Type</InputLabel>
                        <Select
                          name="type"
                          value={values.type}
                          onChange={handleChange}
                          label="Type"
                          style={{ width: "120px" }}
                        >
                          <MenuItem value="hospital">Hospital</MenuItem>
                          <MenuItem value="clinic">Clinic</MenuItem>
                          <MenuItem value="pharmacy">Pharmacy</MenuItem>
                        </Select>
                        <FormHelperText>
                          {touched.type && errors.type}
                        </FormHelperText>
                      </FormControl>
                    </Grid>

                    {["clinicId", "licenseId", "gstId"].map((id) => (
                      <Grid item xs={12} md={4} key={id}>
                        <TextField
                          label={id.toUpperCase()}
                          name={id}
                          fullWidth
                          value={values[id]}
                          onChange={handleChange}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          name="verificationStatus"
                          value={values.verificationStatus}
                          onChange={handleChange}
                          label="Status"
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}

                {activeStep === 1 && (
                  <>
                    {["line1", "city", "state", "country", "pincode"].map(
                      (field) => (
                        <Grid item xs={12} md={6} key={field}>
                          <TextField
                            label={field.toUpperCase()}
                            name={`address.${field}`}
                            fullWidth
                            value={values.address[field]}
                            onChange={handleChange}
                            error={
                              touched.address?.[field] &&
                              !!errors.address?.[field]
                            }
                            helperText={
                              touched.address?.[field] &&
                              errors.address?.[field]
                            }
                          />
                        </Grid>
                      )
                    )}
                  </>
                )}

                {activeStep === 2 && (
                  <>
                    <Grid item xs={6}>
                      <TextField
                        label="Latitude"
                        name="lat"
                        fullWidth
                        value={values.lat}
                        onChange={handleChange}
                        error={touched.lat && !!errors.lat}
                        helperText={touched.lat && errors.lat}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Longitude"
                        name="lng"
                        fullWidth
                        value={values.lng}
                        onChange={handleChange}
                        error={touched.lng && !!errors.lng}
                        helperText={touched.lng && errors.lng}
                      />
                    </Grid>
                  </>
                )}

                {activeStep === 3 && (
                  <>
                    <Grid item xs={12}>
                      <Grid item xs={6} md={6}>
  <FormControl fullWidth>
                        <InputLabel>Available Days</InputLabel>
                        <Select
                          multiple
                          name="availableDays"
                          value={values.availableDays}
                          onChange={handleChange}
                          input={<OutlinedInput label="Available Days" />}
                          renderValue={() => "Select"}
                          style={{ width: "170px" }}
                        >
                          {daysOfWeek.map((day) => (
                            <MenuItem key={day} value={day}>
                              <Checkbox
                                checked={values.availableDays.includes(day)}
                              />
                              <ListItemText primary={day} />
                            </MenuItem>
                          ))}
                        </Select>
                       
                      </FormControl>
                      </Grid>
                         <Grid item xs={6} md={6} sx={{ mt: 2 }}>
                 <Stack direction="row" spacing={1}>
                         
                         {values.availableDays.map((day) => (
                          <Chip
                            label={day}
                            key={day}
                            variant="outlined"
                          />
                         ))}
                        </Stack>
                      </Grid>
                    
                    </Grid>

                    {values.availableDays.map((day) => (
                      <Grid item xs={12} key={day}>
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                          Time Slots for {day}
                        </Typography>
                        <Grid container spacing={2}>
                          {["day", "night"].map((slotType) => (
                            <React.Fragment key={slotType}>
                              <Grid item xs={6} md={3}>
                                <TextField
                                  label={`${day} ${slotType} Start`}
                                  fullWidth
                                  value={
                                    values.availableTimeSlots?.[day]?.[slotType]
                                      ?.start || ""
                                  }
                                  onChange={(e) =>
                                    setFieldValue(
                                      `availableTimeSlots.${day}.${slotType}.start`,
                                      e.target.value
                                    )
                                  }
                                />
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <TextField
                                  label={`${day} ${slotType} End`}
                                  fullWidth
                                  value={
                                    values.availableTimeSlots?.[day]?.[slotType]
                                      ?.end || ""
                                  }
                                  onChange={(e) =>
                                    setFieldValue(
                                      `availableTimeSlots.${day}.${slotType}.end`,
                                      e.target.value
                                    )
                                  }
                                />
                              </Grid>
                            </React.Fragment>
                          ))}
                        </Grid>
                      </Grid>
                    ))}
                  </>
                )}

                {activeStep === 4 && (
                  <>
                    {["images", "documents"].map((field) => (
                      <Grid item xs={12} key={field}>
                        <FieldArray
                          name={field}
                          render={(arrayHelpers) => (
                            <Box>
                              <Typography variant="subtitle2">
                                {field.toUpperCase()}
                              </Typography>
                              {values[field].map((val, index) => (
                                <Box
                                  key={index}
                                  sx={{ mb: 1, display: "flex", gap: 1 }}
                                >
                                  <TextField
                                    fullWidth
                                    value={val}
                                    onChange={(e) => {
                                      const newVal = [...values[field]];
                                      newVal[index] = e.target.value;
                                      setFieldValue(field, newVal);
                                    }}
                                  />
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => arrayHelpers.remove(index)}
                                  >
                                    Remove
                                  </Button>
                                </Box>
                              ))}
                              <Button
                                variant="outlined"
                                onClick={() => arrayHelpers.push("")}
                              >
                                Add {field}
                              </Button>
                            </Box>
                          )}
                        />
                      </Grid>
                    ))}
                  </>
                )}
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
              {!isLastStep ? (
                <Button onClick={handleNext} variant="contained">
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  Submit
                </Button>
              )}
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default FacilityForm;
