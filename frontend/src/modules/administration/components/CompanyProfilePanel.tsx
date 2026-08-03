import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Alert,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { httpClient } from "@shared/api/httpClient";

interface CompanyProfileData {
  id?: number;
  companyName: string;
  tradingName: string;
  registrationNumber: string;
  industry: string;
  logoUrl: string;
  defaultTimezone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  active: boolean;
}

const emptyProfile: CompanyProfileData = {
  companyName: "",
  tradingName: "",
  registrationNumber: "",
  industry: "",
  logoUrl: "",
  defaultTimezone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  phone: "",
  email: "",
  website: "",
  active: true,
};

export const CompanyProfilePanel: React.FC = () => {
  const [form, setForm] = useState<CompanyProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    httpClient
      .get<CompanyProfileData>("/api/admin/organization/profile")
      .then((res) => {
        if (res.data) {
          setForm({
            ...emptyProfile,
            ...res.data,
          });
        }
      })
      .catch(() => {
        // No profile yet — keep empty form
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof CompanyProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    if (!form.companyName.trim()) {
      setSnack({ open: true, message: "Company name is required", severity: "error" });
      return;
    }
    setSaving(true);
    httpClient
      .put<CompanyProfileData>("/api/admin/organization/profile", form)
      .then((res) => {
        setForm({ ...emptyProfile, ...res.data });
        setSnack({ open: true, message: "Company profile saved successfully", severity: "success" });
      })
      .catch(() => {
        setSnack({ open: true, message: "Failed to save company profile", severity: "error" });
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={0.5}>
        Company Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage your organisation's core identity, contact details, and default settings.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Company Identity
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Company Name *"
              value={form.companyName}
              onChange={handleChange("companyName")}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Trading Name"
              value={form.tradingName}
              onChange={handleChange("tradingName")}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Registration Number"
              value={form.registrationNumber}
              onChange={handleChange("registrationNumber")}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Industry"
              value={form.industry}
              onChange={handleChange("industry")}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Default Timezone"
              value={form.defaultTimezone}
              onChange={handleChange("defaultTimezone")}
              fullWidth
              size="small"
              placeholder="e.g. America/New_York"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Logo URL"
              value={form.logoUrl}
              onChange={handleChange("logoUrl")}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Address
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Address Line 1"
              value={form.addressLine1}
              onChange={handleChange("addressLine1")}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address Line 2"
              value={form.addressLine2}
              onChange={handleChange("addressLine2")}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="City"
              value={form.city}
              onChange={handleChange("city")}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="State / Province"
              value={form.state}
              onChange={handleChange("state")}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Country"
              value={form.country}
              onChange={handleChange("country")}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Contact Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Phone"
              value={form.phone}
              onChange={handleChange("phone")}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Email"
              value={form.email}
              onChange={handleChange("email")}
              fullWidth
              size="small"
              type="email"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Website"
              value={form.website}
              onChange={handleChange("website")}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <FormControlLabel
            control={
              <Switch
                checked={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
              />
            }
            label="Active"
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyProfilePanel;
