/**
 * Root Redux Slice
 * 
 * This slice manages core application state including:
 * - Loading state for async operations
 * - User authentication state
 * 
 * It uses JWT for user authentication, decoding the token from localStorage
 * to restore user session on page refresh.
 */
import { createSlice } from "@reduxjs/toolkit";
import jwtDecode from "jwt-decode";

/**
 * Helper function to safely retrieve and decode JWT from localStorage
 * @returns {Object|null} Decoded user information or null if token is invalid/missing
 */
const getUserFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? jwtDecode(token) : null;
  } catch (error) {
    // If token is invalid, remove it and return null
    localStorage.removeItem('token');
    console.error('Invalid token found in localStorage:', error);
    return null;
  }
};

/**
 * Root reducer slice
 * Contains application-wide state
 */
export const rootReducer = createSlice({
  name: "root",
  initialState: {
    loading: false, // Changed default to false for better initial UX
    userInfo: getUserFromToken(),
  },
  reducers: {
    /**
     * Update application loading state
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action with boolean payload
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    /**
     * Update user information after login/logout
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action with user object payload or null on logout
     */
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
  },
});

// Export individual actions
export const { setLoading, setUserInfo } = rootReducer.actions;

// Export the reducer as default
export default rootReducer.reducer;