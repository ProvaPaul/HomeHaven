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
    updateUserStart: (state) => {
      state.loading = true;
    },
    updateUserSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error=null;
    },
    updateUserFailure: (state, action) => {
        state.error=action.payload;
        state.loading = false;
    },
    deleteUserStart: (state) => {
      state.loading = true;
    },
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error=null;
    },
    deleteUserFailure: (state,action) => {
        state.error=action.payload;
        state.loading = false;
  },
}
})

// Action creators are generated for each case reducer function
export const { signInStart,signInSuccess,signInFailure,updateUserFailure,updateUserSuccess,updateUserStart,deleteUserFailure,deleteUserStart,deleteUserSuccess } = userSlice.actions

export const userReducer = userSlice.reducer  // Export as userReducer
