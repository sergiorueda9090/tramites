import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connectedUsers: [],
  isConnected: false,
  connectionError: null,
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.connectionError = null;
      }
    },
    setUsersList: (state, action) => {
      state.connectedUsers = action.payload;
    },
    addUser: (state, action) => {
      const exists = state.connectedUsers.find(
        (u) => u.id === action.payload.id
      );
      if (!exists) {
        state.connectedUsers.push(action.payload);
      }
    },
    removeUser: (state, action) => {
      state.connectedUsers = state.connectedUsers.filter(
        (u) => u.id !== action.payload
      );
    },
    setConnectionError: (state, action) => {
      state.connectionError = action.payload;
    },
    clearPresence: (state) => {
      state.connectedUsers = [];
      state.isConnected = false;
      state.connectionError = null;
    },
  },
});

export const {
  setConnected,
  setUsersList,
  addUser,
  removeUser,
  setConnectionError,
  clearPresence,
} = presenceSlice.actions;

// Selectores
export const selectConnectedUsers = (state) => state.presence.connectedUsers;
export const selectIsConnected = (state) => state.presence.isConnected;
export const selectConnectionError = (state) => state.presence.connectionError;
export const selectOnlineCount = (state) => state.presence.connectedUsers.length;

export default presenceSlice.reducer;
