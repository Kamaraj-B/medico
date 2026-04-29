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
  Tooltip,
  IconButton,
  Stack,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useMemo, useState } from "react";
import CustomTable from "../../components/Utility/CustomTable";
import apiService from "../../services/api.service";

const initialUserForm = {
  username: "",
  email: "",
  mobile: "",
  role: "user",
  isVerified: false,
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

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [formData, setFormData] = useState(initialUserForm);

  const loadData = async () => {
    try {
      const usersRes = await apiService.get("/users");
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(
    () => users.filter((user) => user.role !== "doctor"),
    [users]
  );

  const columns = [
    { id: "username", label: "Name" },
    { id: "email", label: "Email" },
    { id: "mobile", label: "Contact" },
    {
      id: "role",
      label: "Role",
      render: (value) => (
        <Chip
          label={value}
          color={value === "admin" ? "secondary" : "default"}
          size="small"
        />
      ),
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
          <Tooltip title="Edit user">
            <IconButton color="primary" onClick={() => handleEditUser(row)}>
              <EditOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="View user details">
            <IconButton color="info" onClick={() => setViewingUser(row)}>
              <VisibilityOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete user">
            <IconButton color="error" onClick={() => handleDelete(row._id)}>
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData(initialUserForm);
    setOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      mobile: user.mobile || "",
      role: user.role || "user",
      isVerified: Boolean(user.isVerified),
    });
    setOpen(true);
  };

  const handleDelete = async (userId) => {
    try {
      await apiService.delete(`/users/${userId}`);
      await loadData();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingUser?._id) {
        await apiService.put(`/users/${editingUser._id}`, formData);
      } else {
        await apiService.post("/users", formData);
      }
      setOpen(false);
      setEditingUser(null);
      setFormData(initialUserForm);
      await loadData();
    } catch (error) {
      console.error("Failed to save user:", error);
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
        <Typography variant="h5">Users</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd} sx={primaryActionBtnSx}>
          Add User
        </Button>
      </Box>

      <CustomTable data={filteredUsers} columns={columns} />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
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
            disabled={Boolean(editingUser)}
          />
          <TextField
            label="Mobile"
            value={formData.mobile}
            onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              label="Role"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="pharmacyOwner">Pharmacy Owner</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Verification</InputLabel>
            <Select
              value={formData.isVerified ? "verified" : "pending"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isVerified: e.target.value === "verified",
                }))
              }
              label="Verification"
            >
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
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

      <Dialog open={Boolean(viewingUser)} onClose={() => setViewingUser(null)} fullWidth maxWidth="md">
        <DialogTitle>User Full Details</DialogTitle>
        <DialogContent dividers>
          {viewingUser && (
            <Stack spacing={1.2}>
              <Typography><b>Name:</b> {viewingUser.username || "-"}</Typography>
              <Typography><b>Email:</b> {viewingUser.email || "-"}</Typography>
              <Typography><b>Mobile:</b> {viewingUser.mobile || "-"}</Typography>
              <Typography><b>Alternate Mobile:</b> {viewingUser.alternateMobile || "-"}</Typography>
              <Typography><b>Role:</b> {viewingUser.role || "-"}</Typography>
              <Typography><b>Verified:</b> {viewingUser.isVerified ? "Yes" : "No"}</Typography>
              <Typography><b>Address:</b> {viewingUser.address || "-"}</Typography>
              <Typography><b>State:</b> {viewingUser.state || "-"}</Typography>
              <Typography><b>District:</b> {viewingUser.district || "-"}</Typography>
              <Typography><b>Pincode:</b> {viewingUser.pincode || "-"}</Typography>
              <Typography><b>DOB:</b> {viewingUser.personalDetails?.dob ? new Date(viewingUser.personalDetails.dob).toLocaleDateString() : "-"}</Typography>
              <Typography><b>Gender:</b> {viewingUser.personalDetails?.gender || "-"}</Typography>
              <Typography><b>Blood Group:</b> {viewingUser.personalDetails?.bloodGroup || "-"}</Typography>
              <Typography><b>Emergency Contact:</b> {viewingUser.personalDetails?.emergencyContactName || "-"} {viewingUser.personalDetails?.emergencyContactNumber ? `(${viewingUser.personalDetails.emergencyContactNumber})` : ""}</Typography>
              <Typography><b>Bank:</b> {viewingUser.paymentDetails?.bank || "-"}</Typography>
              <Typography><b>Payment Type:</b> {viewingUser.paymentDetails?.paymentType || "-"}</Typography>
              <Typography><b>Card Number:</b> {viewingUser.paymentDetails?.cardNumber || "-"}</Typography>
              <Typography><b>Card Holder:</b> {viewingUser.paymentDetails?.cardName || "-"}</Typography>
              <Typography><b>Expiry:</b> {viewingUser.paymentDetails?.expiry || "-"}</Typography>
              <Typography><b>UPI:</b> {viewingUser.paymentDetails?.upiId || "-"}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setViewingUser(null)} sx={secondaryActionBtnSx}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
