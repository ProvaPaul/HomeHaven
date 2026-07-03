import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';
import { loginUser, registerUser, logoutUser, fetchCurrentUser } from '../auth/authThunks';

export const fetchFavorites = createAsyncThunk(
  'favorites/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/favorites');
      return data.favorites;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggle',
  async (propertyId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/favorites/${propertyId}`);
      return { propertyId, isFavorite: data.isFavorite, message: data.message };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  ids: [],
  items: [],
  status: 'idle',
};

const hydrateFromUser = (state, action) => {
  state.ids = (action.payload?.favorites || []).map(String);
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.items = action.payload;
        state.ids = action.payload.map((p) => String(p._id));
        state.status = 'succeeded';
      })
      .addCase(fetchFavorites.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { propertyId, isFavorite } = action.payload;
        if (isFavorite) {
          if (!state.ids.includes(propertyId)) state.ids.push(propertyId);
        } else {
          state.ids = state.ids.filter((id) => id !== propertyId);
          state.items = state.items.filter((p) => p._id !== propertyId);
        }
      })
      .addCase(loginUser.fulfilled, hydrateFromUser)
      .addCase(registerUser.fulfilled, hydrateFromUser)
      .addCase(fetchCurrentUser.fulfilled, hydrateFromUser)
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const selectFavoriteIds = (state) => state.favorites.ids;
export const selectFavorites = (state) => state.favorites;
export const selectIsFavorite = (id) => (state) => state.favorites.ids.includes(String(id));

export default favoritesSlice.reducer;
