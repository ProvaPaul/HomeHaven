import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    currentUser: null,
  value: 0,
  loading: false,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
    },
    signInFailure: (state, action) => {
        state.error=action.payload;
        state.loading = false;
    },
  },
})

// Action creators are generated for each case reducer function
export const { signInStart,signInSuccess,signInFailure } = userSlice.actions

export const userReducer = userSlice.reducer  // Export as userReducer