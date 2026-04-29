import FacilityForm from "../../components/Forms/FacilityForm";
import CustomTable from "../../components/Utility/CustomTable";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Tooltip,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect } from "react";
import  apiService  from "../../services/api.service";

const fetchFacilities = async () => {
  try {
    const response = await apiService.get("/facilities");
    return response.data;
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return [];
  }
}


const saveFacilities = async (data) => {
  try {
    const response = await apiService.post("/facilities", data);
    return response.data;
  } catch (error) {
    console.error("Error posting facilities:", error);
    return error
  }
}

const updateFacility = async (id, data) => {
  try {
    const response = await apiService.patch(`/facilities/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating facility:", error);
    return error;
  }
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
const touchIconBtnSx = { width: 40, height: 40 };

export default function FacilityPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [facilityData, setFacilityData] = useState([]);
  const [editingFacility, setEditingFacility] = useState(null);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);

  const loadFacilities = async () => {
    const facilities = await fetchFacilities();
    setFacilityData(facilities);
  };

  const loadDoctors = async () => {
    try {
      const response = await apiService.get("/users");
      setAllDoctors((response.data || []).filter((user) => user.role === "doctor"));
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setAllDoctors([]);
    }
  };

  useEffect(() => {
    loadFacilities();
    loadDoctors();
  }, []);

  const openModel = () => {
    setEditingFacility(null);
    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditingFacility(row);
    setOpen(true);
  };

  const handleStatusUpdate = async (row, verificationStatus) => {
    await updateFacility(row._id, { verificationStatus });
    await loadFacilities();
  };

  const handleOpenMapping = (facility) => {
    setSelectedFacility(facility);
    const currentlyMapped = allDoctors
      .filter((doctor) => (doctor.facilityIds || []).includes(facility._id))
      .map((doctor) => doctor._id);
    setSelectedDoctorIds(currentlyMapped);
    setMappingOpen(true);
  };

  const handleSaveMapping = async () => {
    if (!selectedFacility?._id) return;
    try {
      for (const doctor of allDoctors) {
        const existingIds = doctor.facilityIds || [];
        const includesCurrent = existingIds.includes(selectedFacility._id);
        const shouldInclude = selectedDoctorIds.includes(doctor._id);
        let nextIds = existingIds;

        if (shouldInclude && !includesCurrent) {
          nextIds = [...existingIds, selectedFacility._id];
        } else if (!shouldInclude && includesCurrent) {
          nextIds = existingIds.filter((id) => id !== selectedFacility._id);
        }

        if (nextIds !== existingIds) {
          await apiService.put(`/users/${doctor._id}`, { facilityIds: nextIds });
        }
      }

      await loadDoctors();
      setMappingOpen(false);
      setSelectedFacility(null);
      setSelectedDoctorIds([]);
    } catch (error) {
      console.error("Failed to save doctor mapping:", error);
    }
  };

  const columns = [
    { id: "name", label: "Name" },
    {
      id: "owner",
      label: "Owner",
      render: (_, row) => row.owner?.email || "-",
    },
    { id: "type", label: "Type" },
    {
      id: "availableDays",
      label: "Available Days",
      render: (value) => value?.join(", ") || "-",
    },
    {
      id: "verificationStatus",
      label: "Status",
      render: (value) => (
        <Chip
          label={value}
          color={
            value === "approved"
              ? "success"
              : value === "pending"
              ? "warning"
              : "error"
          }
          size="small"
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      render: (_, row) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit facility">
            <IconButton color="primary" onClick={() => handleEdit(row)} sx={touchIconBtnSx}>
              <EditOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Map doctors">
            <IconButton color="info" onClick={() => handleOpenMapping(row)} sx={touchIconBtnSx}>
              <GroupAddOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Approve facility">
            <IconButton
              color="success"
            onClick={() => handleStatusUpdate(row, "approved")}
            disabled={row.verificationStatus === "approved"}
            sx={touchIconBtnSx}
            >
              <CheckCircleOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject facility">
            <IconButton
              color="error"
            onClick={() => handleStatusUpdate(row, "rejected")}
            disabled={row.verificationStatus === "rejected"}
            sx={touchIconBtnSx}
            >
              <HighlightOffOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        px: { xs: 1.5, sm: 3 },
        py: { xs: 1.8, sm: 2.5 },
        borderRadius: 3,
        border: "1px solid #e8edf7",
        boxShadow: "0 8px 24px rgba(16, 24, 40, 0.06)",
        mb: 2,
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} mb={3} spacing={1.2}>
        <Typography variant="h5">Facility Details</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openModel} sx={{ ...primaryActionBtnSx, width: { xs: "100%", sm: "auto" } }}>
          Add Facility
        </Button>
      </Stack>

      <CustomTable data={facilityData} columns={columns} />

      <FacilityForm
        open={open}
        initialData={editingFacility}
        handleClose={() => setOpen(false)}
        onSubmit={async (data) => {
          if (editingFacility?._id) {
            await updateFacility(editingFacility._id, data);
          } else {
            await saveFacilities(data);
          }
          await loadFacilities();
          setEditingFacility(null);
          setOpen(false);
        }}
      />

      <Dialog open={mappingOpen} onClose={() => setMappingOpen(false)} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>
          Map Doctors to {selectedFacility?.name || "Facility"}
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Doctors</InputLabel>
            <Select
              multiple
              value={selectedDoctorIds}
              onChange={(e) => setSelectedDoctorIds(e.target.value)}
              input={<OutlinedInput label="Doctors" />}
              renderValue={(selected) =>
                selected
                  .map(
                    (id) =>
                      allDoctors.find((doctor) => doctor._id === id)?.username || id
                  )
                  .join(", ")
              }
            >
              {allDoctors.map((doctor) => (
                <MenuItem key={doctor._id} value={doctor._id}>
                  <Checkbox checked={selectedDoctorIds.includes(doctor._id)} />
                  <ListItemText
                    primary={doctor.username}
                    secondary={doctor.specialization || doctor.email}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1, p: 2 }}>
          <Button variant="outlined" onClick={() => setMappingOpen(false)} sx={{ ...secondaryActionBtnSx, width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveMapping} sx={{ ...primaryActionBtnSx, width: { xs: "100%", sm: "auto" } }}>
            Save Mapping
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
