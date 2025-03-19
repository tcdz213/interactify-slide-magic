
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ROLES, Role } from '@/utils/roles';
import { authService } from '@/api/auth';

// Define a type for the slice state
interface AuthState {
  isAuthenticated: boolean;
  currentRole: Role;
  user: {
    id?: string;
    fullName?: string;
    email?: string;
    userType?: 'learner' | 'center' | 'teacher';
    emailVerified?: boolean;
  } | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  isSessionPersisted: boolean;
}

// Define the initial state with session persistence
const initialState: AuthState = {
  isAuthenticated: authService.isAuthenticated(),
  currentRole: localStorage.getItem('userRole') as Role || ROLES.GUEST,
  user: null,
  loading: false,
  error: null,
  token: localStorage.getItem('token'),
  isSessionPersisted: !!localStorage.getItem('token'),
};

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { 
    fullName: string; 
    email: string; 
    password: string;
    userType: 'learner' | 'center' | 'teacher';
  }, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Registration failed');
      }
      return rejectWithValue('Registration failed. Please try again.');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authService.verifyEmail(token);
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Email verification failed');
      }
      return rejectWithValue('Email verification failed. Please try again.');
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.requestPasswordReset(email);
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Password reset request failed');
      }
      return rejectWithValue('Password reset request failed. Please try again.');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { token: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(data.token, data.newPassword);
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Password reset failed');
      }
      return rejectWithValue('Password reset failed. Please try again.');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Login failed');
      }
      return rejectWithValue('Login failed. Please check your credentials.');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to fetch user');
      }
      return rejectWithValue('Failed to fetch user data.');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
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
    changeRole: (state, action: PayloadAction<Role>) => {
      state.currentRole = action.payload;
      localStorage.setItem('userRole', action.payload);
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
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
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // Usually after registration, you'll want to redirect to login
        // so we don't set isAuthenticated here
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
    
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
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
    
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
        state.currentRole = action.payload.role;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
    
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
      })
    
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
      })
    
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

export default authSlice.reducer;
