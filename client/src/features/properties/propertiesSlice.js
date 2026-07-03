import { createSlice } from '@reduxjs/toolkit';
import {
  fetchProperties,
  fetchFeaturedProperties,
  fetchLatestProperties,
  fetchProperty,
} from './propertyThunks';

const initialState = {
  list: { items: [], total: 0, page: 1, pages: 1, status: 'idle', error: null },
  featured: { items: [], status: 'idle' },
  latest: { items: [], status: 'idle' },
  current: { property: null, status: 'idle', error: null },
};

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    clearCurrentProperty(state) {
      state.current = { property: null, status: 'idle', error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.list.status = 'loading';
        state.list.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        const { properties, total, page, pages } = action.payload;
        state.list = { items: properties, total, page, pages, status: 'succeeded', error: null };
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.list.status = 'failed';
        state.list.error = action.payload;
      })

      .addCase(fetchFeaturedProperties.pending, (state) => {
        state.featured.status = 'loading';
      })
      .addCase(fetchFeaturedProperties.fulfilled, (state, action) => {
        state.featured = { items: action.payload, status: 'succeeded' };
      })
      .addCase(fetchFeaturedProperties.rejected, (state) => {
        state.featured.status = 'failed';
      })

      .addCase(fetchLatestProperties.pending, (state) => {
        state.latest.status = 'loading';
      })
      .addCase(fetchLatestProperties.fulfilled, (state, action) => {
        state.latest = { items: action.payload, status: 'succeeded' };
      })
      .addCase(fetchLatestProperties.rejected, (state) => {
        state.latest.status = 'failed';
      })

      .addCase(fetchProperty.pending, (state) => {
        state.current = { property: null, status: 'loading', error: null };
      })
      .addCase(fetchProperty.fulfilled, (state, action) => {
        state.current = { property: action.payload, status: 'succeeded', error: null };
      })
      .addCase(fetchProperty.rejected, (state, action) => {
        state.current = { property: null, status: 'failed', error: action.payload };
      });
  },
});

export const { clearCurrentProperty } = propertiesSlice.actions;

export const selectPropertyList = (state) => state.properties.list;
export const selectFeatured = (state) => state.properties.featured;
export const selectLatest = (state) => state.properties.latest;
export const selectCurrentProperty = (state) => state.properties.current;

export default propertiesSlice.reducer;
