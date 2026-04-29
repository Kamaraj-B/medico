import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.service";

// Async thunk to fetch facility + doctors
export const fetchFacilityWithDoctors = createAsyncThunk(
  "booking/fetchFacilityWithDoctors",
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/facilities/${id}`);
      // assuming API returns { facility: {...}, doctors: [...] }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to save booking
export const saveBooking = createAsyncThunk(
  "booking/saveBooking",
  async (payload, thunkAPI) => {
    try {
      const response = await api.post("/appointments", payload);
      if (response.status === 201) {
        return response.data; // booked appointment data
      } else {
        return thunkAPI.rejectWithValue("Booking failed");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);


const initialState = {
  facility: {},
  doctors: [],
  loading: false,
  error: null,
  booking: null,        // stores newly booked appointment
  bookingLoading: false, // loading state for booking
  bookingError: null,
};


const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingData: (state) => {
      state.facility = {};
      state.doctors = [];
      state.loading = false;
      state.error = null;
    },
  },
extraReducers: (builder) => {
  builder
    // fetch facility + doctors
    .addCase(fetchFacilityWithDoctors.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchFacilityWithDoctors.fulfilled, (state, action) => {
      state.loading = false;
      state.facility = action.payload.facility;
      state.doctors = action.payload.doctors;
    })
    .addCase(fetchFacilityWithDoctors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // save booking
    .addCase(saveBooking.pending, (state) => {
      state.bookingLoading = true;
      state.bookingError = null;
    })
    .addCase(saveBooking.fulfilled, (state, action) => {
      state.bookingLoading = false;
      state.booking = action.payload;
    })
    .addCase(saveBooking.rejected, (state, action) => {
      state.bookingLoading = false;
      state.bookingError = action.payload;
    });
}

});

export const { clearBookingData } = bookingSlice.actions;
export default bookingSlice.reducer;
