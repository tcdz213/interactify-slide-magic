import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/api/auth";
import {
  LoginCredentials,
  PasswordResetData,
  RegistrationData,
} from "../types/authTypes";

export const registerUser = createAsyncThunk(
  "api/user/register",
  async (userData: RegistrationData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Registration failed"
        );
      }
      return rejectWithValue("Registration failed. Please try again.");
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authService.verifyEmail(token);
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Email verification failed"
        );
      }
      return rejectWithValue("Email verification failed. Please try again.");
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.requestPasswordReset(email);
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Password reset request failed"
        );
      }
      return rejectWithValue(
        "Password reset request failed. Please try again."
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: PasswordResetData, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(
        data.token,
        data.newPassword
      );
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Password reset failed"
        );
      }
      return rejectWithValue("Password reset failed. Please try again.");
    }
  }
);

export const loginUser = createAsyncThunk(
  "api/user/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || "Login failed");
      }
      return rejectWithValue("Login failed. Please check your credentials.");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch user"
        );
      }
      return rejectWithValue("Failed to fetch user data.");
    }
  }
);
