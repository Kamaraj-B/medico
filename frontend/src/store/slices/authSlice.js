
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/api.service";

const persistToken = (token) => {
  if (token) localStorage.setItem("tokenInfo", JSON.stringify(token));
};

export const loginWithPassword = createAsyncThunk(
  "auth/loginWithPassword",
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const res = await apiService.post("/auth/login", { identifier, password });
      if (res.status === 200) {
        persistToken(res.data.token);
        return res.data;
      }
      return rejectWithValue("Login failed");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const registerPatient = createAsyncThunk(
  "auth/registerPatient",
  async ({ username, email }, { rejectWithValue }) => {
    try {
      const res = await apiService.post("/auth/register", { username, email });
      if (res.status === 201 || res.status === 200) {
        return res.data;
      }
      return rejectWithValue("Registration failed");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const requestDoctorAccount = createAsyncThunk(
  "auth/requestDoctorAccount",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiService.post("/auth/doctor-request", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.get("/auth/token/verify");
      if (res.status === 200) {
        persistToken(res.data.token);
        return res.data;
      }
      return rejectWithValue("Profile fetch failed");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await apiService.get("/auth/token/refresh");
      if (res.status === 200 && res.data?.token) {
        const token = res.data.token;
        persistToken(token);
        if (res.data.user) dispatch(setUser(res.data.user));
        return res.data;
      }
      dispatch(logout());
      return rejectWithValue("Token refresh failed");
    } catch (err) {
      dispatch(logout());
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, { dispatch }) => {
  try {
    await apiService.get("/auth/logout");
    location.href = "/login";
  } catch (e) {
    console.warn("Logout API failed:", e);
  }
  localStorage.removeItem("tokenInfo");
  dispatch(clearUser());
});

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const res = await apiService.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// Update user details
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const res = await apiService.put(`/users/${userId}`, formData);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Upload profile image
export const uploadUserProfileImage = createAsyncThunk(
  "auth/uploadUserProfileImage",
  async ({ userId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("profile", file);

      const res = await apiService.patch(`/users/${userId}/upload-profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// Initial State
const initialState = {
  user: null,
  isAuthenticated: false,
  requirePasswordChange: false,
  accountStatus: null,
  loading: false,
  error: null,
  doctorRequestSubmitted: false,
  onboardingMessage: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.requirePasswordChange = false;
      state.accountStatus = null;
      state.doctorRequestSubmitted = false;
      state.onboardingMessage = "";
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.requirePasswordChange = Boolean(action.payload.requirePasswordChange);
        state.accountStatus = action.payload.accountStatus || "active";
        state.loading = false;
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(registerPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.onboardingMessage = "";
      })
      .addCase(registerPatient.fulfilled, (state, action) => {
        state.onboardingMessage = action.payload.message || "Check your email for setup link.";
        state.loading = false;
      })
      .addCase(registerPatient.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(requestDoctorAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.doctorRequestSubmitted = false;
        state.onboardingMessage = "";
      })
      .addCase(requestDoctorAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorRequestSubmitted = true;
        state.onboardingMessage =
          action.payload?.message || "Doctor request submitted. Please wait for admin approval.";
      })
      .addCase(requestDoctorAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.requirePasswordChange = Boolean(action.payload.requirePasswordChange);
        state.accountStatus = action.payload.accountStatus || "active";
        state.loading = false;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // refresh token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accountStatus = action.payload?.accountStatus || state.accountStatus;
        state.requirePasswordChange = Boolean(
          action.payload?.requirePasswordChange ?? state.requirePasswordChange
        );
        state.loading = false;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(uploadUserProfileImage.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.requirePasswordChange = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      // logout handled in reducer
  },
});

export const { setUser, clearUser, updateUser } = authSlice.actions;
export default authSlice.reducer;
