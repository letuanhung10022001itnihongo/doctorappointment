/**
 * Redux Store Configuration
 * 
 * This file configures the Redux store for the application.
 * It combines all reducers and applies middleware.
 */
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers/rootSlice";

/**
 * Configure and create the Redux store
 * 
 * The store is created with the following:
 * - Root reducer that handles core application state
 * - Redux DevTools extension enabled for development
 * - Default middleware configuration
 * 
 * @returns {Object} Configured Redux store
 */
const store = configureStore({
  reducer: {
    root: rootReducer,
    // Additional reducers can be added here as the application grows
  },
  // Enable Redux DevTools extension in development environment only
  devTools: process.env.NODE_ENV !== 'production',
  // Middleware configuration can be customized here if needed
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(customMiddleware),
});

/**
 * Export store for use in application
 * 
 * This store should be provided at the root of the app using:
 * <Provider store={store}>
 */
export default store;