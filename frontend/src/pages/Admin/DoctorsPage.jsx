import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Tooltip,
  IconButton,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useMemo, useState } from "react";
import CustomTable from "../../components/Utility/CustomTable";
import apiService from "../../services/api.service";

const initialDoctorForm = {
  username: "",
  email: "",
  mobile: "",
  specialization: "",
  experience: "",
  facilityIds: [],
  availableDays: [],
  availableTime: {},
};

const defaultDoctorAvailability = (days = [], existing = {}) => {
  const map = { ...existing };
  days.forEach((day) => {
    if (!map[day]) {
      map[day] = { day: "09:00-13:00", night: "17:00-20:00" };
    }
  });
  return map;
};

const primaryActionBtnSx = {
  textTransform: "none",
  fontFamily: "Manrope",
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 999,
  px: 2.4,
  py: 1,
  background: "linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%)",
  boxShadow: "0 8px 18px rgba(37, 99, 235, 0.28)",
  "&:hover": {
    background: "linear-gradient(90deg, #0284c7 0%, #1d4ed8 100%)",
  },
};
const secondaryActionBtnSx = {
  textTransform: "none",
  fontFamily: "Manrope",
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 999,
  px: 2.3,
  py: 0.9,
  borderColor: "#60a5fa",
  color: "#1d4ed8",
  "&:hover": {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState(initialDoctorForm);

  const facilityNameMap = useMemo(() => {
    const map = new Map();
    facilities.forEach((facility) => map.set(facility._id, facility.name));
    return map;
  }, [facilities]);

  const loadData = async () => {
    try {
      const [usersRes, facilitiesRes] = await Promise.all([
        apiService.get("/users"),
        apiService.get("/facilities"),
      ]);
      setFacilities(facilitiesRes.data || []);
      setDoctors((usersRes.data || []).filter((user) => user.role === "doctor"));
    } catch (error) {
      console.error("Failed to load doctor data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    { id: "username", label: "Name" },
    { id: "specialization", label: "Specialization" },
    { id: "mobile", label: "Contact" },
    {
      id: "facilityIds",
      label: "Facilities",
      render: (value) =>
        (value || [])
          .map((facilityId) => facilityNameMap.get(facilityId) || "-")
          .join(", ") || "-",
    },
    {
      id: "isVerified",
      label: "Status",
      render: (value) => (
        <Chip
          label={value ? "Verified" : "Pending"}
          color={value ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      render: (_, row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit doctor">
            <IconButton color="primary" onClick={() => handleEdit(row)}>
              <EditOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete doctor">
            <IconButton color="error" onClick={() => handleDelete(row._id)}>
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData(initialDoctorForm);
    setOpen(true);
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      username: doctor.username || "",
      email: doctor.email || "",
      mobile: doctor.mobile || "",
      specialization: doctor.specialization || "",
      experience: doctor.experience || "",
      facilityIds: doctor.facilityIds || [],
      availableDays: doctor.availableDays || [],
      availableTime: doctor.availableTime || {},
    });
    setOpen(true);
  };

  const handleDelete = async (doctorId) => {
    try {
      await apiService.delete(`/users/${doctorId}`);
      await loadData();
    } catch (error) {
      console.error("Failed to delete doctor:", error);
    }
  };

  const handleSave = async () => {
    const availableTime = defaultDoctorAvailability(
      formData.availableDays || [],
      formData.availableTime || {}
    );
    const payload = {
      ...formData,
      role: "doctor",
      experience: formData.experience ? Number(formData.experience) : undefined,
      isVerified: true,
      availableTime,
    };

    try {
      if (editingDoctor?._id) {
        await apiService.put(`/users/${editingDoctor._id}`, payload);
      } else {
        await apiService.post("/users", payload);
      }
      setOpen(false);
      setEditingDoctor(null);
      setFormData(initialDoctorForm);
      await loadData();
    } catch (error) {
      console.error("Failed to save doctor:", error);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        px: 3,
        py: 2.5,
        borderRadius: 3,
        border: "1px solid #e8edf7",
        boxShadow: "0 8px 24px rgba(16, 24, 40, 0.06)",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Doctors</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd} sx={primaryActionBtnSx}>
          Add Doctor
        </Button>
      </Box>

      <CustomTable data={doctors} columns={columns} />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingDoctor ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            fullWidth
            disabled={Boolean(editingDoctor)}
          />
          <TextField
            label="Mobile"
            value={formData.mobile}
            onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Specialization"
            value={formData.specialization}
            onChange={(e) => setFormData((prev) => ({ ...prev, specialization: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Experience (years)"
            type="number"
            value={formData.experience}
            onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Available Days</InputLabel>
            <Select
              multiple
              value={formData.availableDays}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  availableDays: e.target.value,
                  availableTime: defaultDoctorAvailability(
                    e.target.value,
                    prev.availableTime || {}
                  ),
                }))
              }
              input={<OutlinedInput label="Available Days" />}
              renderValue={(selected) => selected.join(", ")}
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <MenuItem key={day} value={day}>
                  <Checkbox checked={formData.availableDays.includes(day)} />
                  <ListItemText primary={day} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {(formData.availableDays || []).map((day) => (
            <Box key={day} sx={{ border: "1px solid #eee", borderRadius: 1, p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {day} Time Slots
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                <TextField
                  label="Day Slot (e.g. 09:00-13:00)"
                  value={formData.availableTime?.[day]?.day || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      availableTime: {
                        ...(prev.availableTime || {}),
                        [day]: {
                          ...(prev.availableTime?.[day] || {}),
                          day: e.target.value,
                        },
                      },
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Night Slot (e.g. 17:00-20:00)"
                  value={formData.availableTime?.[day]?.night || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      availableTime: {
                        ...(prev.availableTime || {}),
                        [day]: {
                          ...(prev.availableTime?.[day] || {}),
                          night: e.target.value,
                        },
                      },
                    }))
                  }
                  fullWidth
                />
              </Box>
            </Box>
          ))}
          <FormControl fullWidth>
            <InputLabel>Facility Mapping</InputLabel>
            <Select
              multiple
              value={formData.facilityIds}
              onChange={(e) => setFormData((prev) => ({ ...prev, facilityIds: e.target.value }))}
              input={<OutlinedInput label="Facility Mapping" />}
              renderValue={(selected) =>
                selected.map((id) => facilityNameMap.get(id) || id).join(", ")
              }
            >
              {facilities.map((facility) => (
                <MenuItem key={facility._id} value={facility._id}>
                  <Checkbox checked={formData.facilityIds.includes(facility._id)} />
                  <ListItemText primary={facility.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpen(false)} sx={secondaryActionBtnSx}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} sx={primaryActionBtnSx}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
