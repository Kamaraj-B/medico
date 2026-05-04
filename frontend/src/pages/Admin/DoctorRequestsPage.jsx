import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import apiService from "../../services/api.service";

export default function DoctorRequestsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [approveDialog, setApproveDialog] = useState({
    open: false,
    requestId: "",
  });
  const [rejectDialog, setRejectDialog] = useState({
    open: false,
    requestId: "",
    reason: "",
  });

  const loadPendingRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiService.get("/auth/doctor-requests/pending");
      setItems(response.data?.items || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load doctor requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const approveRequest = async () => {
    try {
      setError("");
      setSuccess("");
      await apiService.post(`/auth/doctor-requests/${approveDialog.requestId}/approve`, {});
      setSuccess("Doctor request approved and password setup email sent.");
      setApproveDialog({ open: false, requestId: "" });
      loadPendingRequests();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to approve request.");
    }
  };

  const rejectRequest = async () => {
    try {
      setError("");
      setSuccess("");
      await apiService.post(`/auth/doctor-requests/${rejectDialog.requestId}/reject`, {
        reason: rejectDialog.reason,
      });
      setSuccess("Doctor request rejected.");
      setRejectDialog({ open: false, requestId: "", reason: "" });
      loadPendingRequests();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to reject request.");
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" sx={{ fontFamily: "Manrope", fontWeight: 800 }}>
          Doctor Requests
        </Typography>
        <Button variant="outlined" onClick={loadPendingRequests}>
          Refresh
        </Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
      {loading ? <Typography color="text.secondary">Loading requests...</Typography> : null}

      {!loading && !items.length ? (
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary">No pending doctor requests.</Typography>
          </CardContent>
        </Card>
      ) : null}

      <Stack spacing={2}>
        {items.map((item) => (
          <Card key={item._id} variant="outlined">
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.username}</Typography>
                  <Chip size="small" label={item.accountStatus} />
                </Stack>
                <Typography variant="body2" color="text.secondary">{item.email}</Typography>
                <Typography variant="body2">
                  Specialization: <b>{item.specialization || "-"}</b>
                </Typography>
                <Typography variant="body2">
                  Experience: <b>{item.experience || 0} years</b>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Days: {(item.availableDays || []).join(", ") || "-"}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Registration No: <b>{item.doctorVerification?.registrationNumber || "-"}</b>
                </Typography>
                <Typography variant="body2">
                  Council: <b>{item.doctorVerification?.medicalCouncil || "-"}</b>
                </Typography>
                <Typography variant="body2">
                  Year: <b>{item.doctorVerification?.registrationYear || "-"}</b>
                </Typography>
                <Typography variant="body2">
                  Degree: <b>{item.doctorVerification?.degree || "-"}</b>
                </Typography>
                <Typography variant="body2">
                  University: <b>{item.doctorVerification?.university || "-"}</b>
                </Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Button
                    variant="contained"
                    onClick={() =>
                      setApproveDialog({
                        open: true,
                        requestId: item._id,
                      })
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      setRejectDialog({
                        open: true,
                        requestId: item._id,
                        reason: "",
                      })
                    }
                  >
                    Reject
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog
        open={approveDialog.open}
        onClose={() => setApproveDialog({ open: false, requestId: "" })}
      >
        <DialogTitle>Approve Doctor Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Approving this request will activate doctor access and send a password setup email.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setApproveDialog({ open: false, requestId: "" })}
          >
            Cancel
          </Button>
          <Button onClick={approveRequest} variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, requestId: "", reason: "" })}
      >
        <DialogTitle>Reject Doctor Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Reason (optional)"
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, requestId: "", reason: "" })}>
            Cancel
          </Button>
          <Button onClick={rejectRequest} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

