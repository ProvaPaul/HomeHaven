import { createSlice } from '@reduxjs/toolkit';

const KEY = 'homehaven-compare';
export const COMPARE_LIMIT = 3;

const load = () => {
  try {
    const ids = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(ids) ? ids.slice(0, COMPARE_LIMIT) : [];
  } catch {
    return [];
  }
};

const persist = (ids) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // best-effort persistence
  }
};

const compareSlice = createSlice({
  name: 'compare',
  initialState: { ids: load() },
  reducers: {
    toggleCompare(state, action) {
      const id = String(action.payload);
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((x) => x !== id);
      } else if (state.ids.length < COMPARE_LIMIT) {
        state.ids.push(id);
      }
      persist(state.ids);
    },
    removeFromCompare(state, action) {
      state.ids = state.ids.filter((x) => x !== String(action.payload));
      persist(state.ids);
    },
    clearCompare(state) {
      state.ids = [];
      persist(state.ids);
    },
  },
});

export const { toggleCompare, removeFromCompare, clearCompare } = compareSlice.actions;

export const selectCompareIds = (state) => state.compare.ids;
export const selectIsCompared = (id) => (state) => state.compare.ids.includes(String(id));

export default compareSlice.reducer;
