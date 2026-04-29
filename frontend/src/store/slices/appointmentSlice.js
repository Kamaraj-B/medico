
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.service";

// Fetch all appointments
export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAppointments",
  async ({ path = "", query = {} } = {}, { rejectWithValue }) => {
    try {
      // Build query string
      const queryString = new URLSearchParams(query).toString();

      // Construct final URL
      let url = "/appointments";
      if (path) url += `/${path}`;
      if (queryString) url += `?${queryString}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// ✅ Add appointment
export const addAppointment = createAsyncThunk(
  "appointments/addAppointment",
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Update appointment (general fields)
export const updateAppointment = createAsyncThunk(
  "appointments/updateAppointment",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/appointments/${id}`, updatedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Update ONLY status (cleaner than full update)
export const updateAppointmentStatus = createAsyncThunk(
  "appointments/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/appointments/${id}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Delete
export const deleteAppointment = createAsyncThunk(
  "appointments/deleteAppointment",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/appointments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const appointmentSlice = createSlice({
  name: "appointments",
  initialState: {
    list: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.list = action.payload;
          state.pagination = {
            page: 1,
            limit: action.payload.length || 10,
            total: action.payload.length || 0,
            totalPages: 1,
          };
          return;
        }

        state.list = action.payload?.items || [];
        state.pagination = {
          page: action.payload?.page || 1,
          limit: action.payload?.limit || 10,
          total: action.payload?.total || 0,
          totalPages: action.payload?.totalPages || 1,
        };
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addAppointment.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // Update
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.list.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      // Update Status
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.list = state.list.filter((a) => a._id !== action.payload);
      });
  },
});

export default appointmentSlice.reducer;
