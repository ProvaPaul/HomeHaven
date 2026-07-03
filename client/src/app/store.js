import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import propertiesReducer from '../features/properties/propertiesSlice';
import favoritesReducer from '../features/favorites/favoritesSlice';
import compareReducer from '../features/compare/compareSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    favorites: favoritesReducer,
    compare: compareReducer,
  },
  devTools: import.meta.env.DEV,
});
