import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchProperties = createAsyncThunk(
  'properties/fetchList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/properties', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFeaturedProperties = createAsyncThunk(
  'properties/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/properties/featured', { params: { limit: 6 } });
      return data.properties;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLatestProperties = createAsyncThunk(
  'properties/fetchLatest',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/properties', { params: { sort: 'newest', limit: 6 } });
      return data.properties;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProperty = createAsyncThunk(
  'properties/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/properties/${id}`);
      return data.property;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProperty = createAsyncThunk(
  'properties/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/properties', payload);
      return data.property;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProperty = createAsyncThunk(
  'properties/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/properties/${id}`, payload);
      return data.property;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'properties/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/properties/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
