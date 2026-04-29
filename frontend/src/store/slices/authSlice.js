
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/api.service";

// Async Thunks
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (idToken, { rejectWithValue }) => {
    try {
      const res = await apiService.post("/auth/login/google", { idToken });
      if (res.status === 200) {
        localStorage.setItem("tokenInfo", JSON.stringify(res.data.token));
        return res.data.user;
      }
      return rejectWithValue("Login failed");
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.get("/auth/token/verify");
      if (res.status === 200) {
        if (res.data.token) localStorage.setItem("tokenInfo", JSON.stringify(res.data.token));
        return res.data.user;
      }
      return rejectWithValue("Profile fetch failed");
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
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
        localStorage.setItem("tokenInfo", JSON.stringify(token));
        if (res.data.user) dispatch(setUser(res.data.user));
        return token;
      }
      dispatch(logout());
      return rejectWithValue("Token refresh failed");
    } catch (err) {
      dispatch(logout());
      return rejectWithValue(err.response?.data || err.message);
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
  loading: false,
  error: null,
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
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
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
      .addCase(refreshToken.fulfilled, (state) => {
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
    });
      // logout handled in reducer
      
  },
});

export const { setUser, clearUser, updateUser } = authSlice.actions;
export default authSlice.reducer;
