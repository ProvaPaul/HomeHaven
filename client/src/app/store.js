import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import propertiesReducer from '../features/properties/propertiesSlice';
import favoritesReducer from '../features/favorites/favoritesSlice';
import compareReducer from '../features/compare/compareSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    favorites: favoritesReducer,
    compare: compareReducer,
    notifications: notificationsReducer,
  },
  devTools: import.meta.env.DEV,
});
