import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button, IconButton,
  Tooltip
} from "@mui/material";
import React, { useState, useEffect } from "react";
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

const statusList = ["pending", "scheduled", "completed", "rejected", "cancelled"];
const modeList = ["in-person", "video", "chat", "audio"];

const FilterPanel = ({ handleFilterChange, hospitals,filters, handleClearFilters }) => {
  const [localUserName, setLocalUserName] = useState(
    filters.patientName || filters.doctorName || ""
  );
  const tokenInfo = localStorage.getItem("tokenInfo");
  const role = tokenInfo ? JSON.parse(tokenInfo)?.role : "user";
  const nameFilterKey = role === "doctor" ? "patientName" : "doctorName";

  // Debounce doctorName input
  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilterChange(nameFilterKey, localUserName);
    }, 500);

    return () => clearTimeout(handler);
  }, [localUserName, nameFilterKey, handleFilterChange]);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "center",
        p: 2,
        ml: 2,
        mb: 2,
        mt: 2,
      }}
    >
      <FormControl sx={{ minWidth: 180 }}>
        <Select
          value={filters.facility}
          onChange={(e) => handleFilterChange("facility", e.target.value)}
        >
          <MenuItem value="All">All</MenuItem>
         {hospitals.map((hospital) => (
            <MenuItem key={hospital} value={hospital}>
              {hospital}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

    <FormControl sx={{ minWidth: 180 }}>
        <Select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <MenuItem value="All">All</MenuItem>
         {statusList.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        type="date"
        label="From Date"
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 180 }}
        value={filters.fromDate}
        onChange={(e) => handleFilterChange("fromDate", e.target.value)}
      />

      <TextField
        type="date"
        label="To Date"
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 180 }}
        value={filters.toDate}
        onChange={(e) => handleFilterChange("toDate", e.target.value)}
      />

      <FormControl sx={{ minWidth: 180 }}>
        <Select
          value={filters.mode}
          onChange={(e) => handleFilterChange("mode", e.target.value)}
          displayEmpty
        >
          <MenuItem value="All">All Modes</MenuItem>
          {modeList.map((mode) => (
            <MenuItem key={mode} value={mode}>
              {mode}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label={role === "doctor" ? "Search by Patient Name" : "Search by Doctor Name"}
        variant="outlined"
        sx={{ minWidth: 220 }}
        value={localUserName}
        onChange={(e) => setLocalUserName(e.target.value)}
      />
 <Tooltip title="Click to clear filters">
      <IconButton aria-label="" onClick={handleClearFilters}>
        <FilterAltOffIcon /> 
      </IconButton>
      </Tooltip>
    </Box>
  );
};

export default FilterPanel;
