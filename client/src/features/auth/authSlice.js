import { createSlice } from '@reduxjs/toolkit';
import { registerUser, loginUser, logoutUser, fetchCurrentUser, updateProfile } from './authThunks';

const initialState = {
  user: null,
  status: 'idle', // idle | loading | succeeded | failed
  // True until the initial /auth/me check completes, so guards can wait
  isCheckingAuth: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading';
      state.error = null;
    };
    const rejected = (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    };
    const authenticated = (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload;
      state.error = null;
    };

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, authenticated)
      .addCase(registerUser.rejected, rejected)

      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, authenticated)
      .addCase(loginUser.rejected, rejected)

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
        state.error = null;
      })

      .addCase(fetchCurrentUser.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isCheckingAuth = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isCheckingAuth = false;
      })

      .addCase(updateProfile.pending, pending)
      .addCase(updateProfile.fulfilled, authenticated)
      .addCase(updateProfile.rejected, rejected);
  },
});

export const { clearAuthError } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectAuthStatus = (state) => state.auth.status;
export const selectIsCheckingAuth = (state) => state.auth.isCheckingAuth;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
