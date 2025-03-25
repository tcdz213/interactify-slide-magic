
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ROLES } from "@/utils/roles";
import { authService } from "@/api/auth";
import { AuthState } from "../types/authTypes";
import { userTypeToRole } from "../utils/authUtils";
import {
  registerUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  loginUser,
  fetchCurrentUser
} from "../thunks/authThunks";

// Define the initial state with session persistence
const initialState: AuthState = {
  isAuthenticated: authService.isAuthenticated(),
  currentRole: userTypeToRole(authService.getStoredRole()),
  user: authService.getStoredUser(),
  loading: false,
  error: null,
  token: localStorage.getItem("token"),
  isSessionPersisted: !!localStorage.getItem("token"),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentRole = ROLES.GUEST;
      state.user = null;
      state.token = null;
      state.isSessionPersisted = false;
      authService.logout();
    },
    changeRole: (state, action: PayloadAction<typeof ROLES[keyof typeof ROLES]>) => {
      state.currentRole = action.payload;
      localStorage.setItem("userRole", action.payload);
    },
    setUser: (state, action: PayloadAction<AuthState["user"]>) => {
      state.user = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
        state.currentRole = userTypeToRole(action.payload.userType);
      }
    },
    persistSession: (state, action: PayloadAction<boolean>) => {
      state.isSessionPersisted = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        // Usually after registration, you'll want to redirect to login
        // so we don't set isAuthenticated here
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        if (state.user) {
          state.user.emailVerified = true;
          state.user.isEmailVerified = true;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload.user;
        state.currentRole = userTypeToRole(action.payload.user?.userType);
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Password reset request
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        if (action.payload?.userType) {
          state.currentRole = userTypeToRole(action.payload.userType);
        }
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { logout, changeRole, setUser, persistSession } = authSlice.actions;

// Re-export the thunks to maintain the same import pattern
export {
  registerUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  loginUser,
  fetchCurrentUser
};

export default authSlice.reducer;
