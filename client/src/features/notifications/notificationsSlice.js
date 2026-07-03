import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';
import { logoutUser } from '../auth/authThunks';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/notifications');
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/notifications/${id}/read`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/read-all');
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  unread: 0,
  status: 'idle',
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.notifications;
        state.unread = action.payload.unread;
        state.status = 'succeeded';
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n._id === action.payload);
        if (item && !item.read) {
          item.read = true;
          state.unread = Math.max(0, state.unread - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.read = true;
        });
        state.unread = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const item = state.items.find((n) => n._id === action.payload);
        if (item && !item.read) state.unread = Math.max(0, state.unread - 1);
        state.items = state.items.filter((n) => n._id !== action.payload);
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const selectNotifications = (state) => state.notifications;
export const selectUnreadCount = (state) => state.notifications.unread;

export default notificationsSlice.reducer;
