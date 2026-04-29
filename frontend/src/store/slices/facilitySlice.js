import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.service";

// Fetch all facilities
export const fetchFacilities = createAsyncThunk(
  "facility/fetchFacilities",
  async () => {
    const res = await api.get("/facilities?isVerified=approved");
    return res.data;
  }
);

// Add a facility
export const addFacilityAsync = createAsyncThunk(
  "facility/addFacilityAsync",
  async (facilityData) => {
    const res = await api.post("/facilities", facilityData);
    return res.data;
  }
);

// Update a facility
export const updateFacilityAsync = createAsyncThunk(
  "facility/updateFacilityAsync",
  async ({ id, data }) => {
    const res = await api.put(`/facilities/${id}`, data);
    return res.data;
  }
);

const initialState = {
  facility: [],
  loading: false,
  error: null,
};

const facilitySlice = createSlice({
  name: "facility",
  initialState,
  reducers: {
    clearFacility: (state) => {
      state.facility = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.loading = false;
        state.facility = action.payload;
      })
      .addCase(fetchFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(addFacilityAsync.fulfilled, (state, action) => {
        state.facility.push(action.payload);
      })
      .addCase(updateFacilityAsync.fulfilled, (state, action) => {
        const index = state.facility.findIndex(f => f.id === action.payload.id);
        if (index !== -1) state.facility[index] = action.payload;
      });
  },
});

export const { clearFacility } = facilitySlice.actions;
export default facilitySlice.reducer;
