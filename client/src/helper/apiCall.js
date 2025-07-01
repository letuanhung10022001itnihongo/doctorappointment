import axios from "axios";

// Set the base URL for all axios requests from environment variables
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * Makes an authenticated HTTP request to the specified endpoint
 * Automatically includes the authentication token from localStorage
 * 
 * @param {string} url - The API endpoint to fetch data from
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE) - defaults to 'GET'
 * @param {Object} data - Request body data for POST/PUT requests
 * @returns {Promise<any>} - Promise resolving to the response data
 * @throws {Error} - Throws error if the request fails
 */
const fetchData = async (url, method = 'GET', data = null) => {
  try {
    // Get the authentication token from localStorage
    const token = localStorage.getItem("token");
    
    // Configure request options
    const config = {
      method: method.toUpperCase(),
      url: url,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        'Content-Type': 'application/json'
      }
    };

    // Add data to request body for POST/PUT requests
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = data;
    }
    
    // Make the authenticated request
    const response = await axios(config);
    
    return response.data;
  } catch (error) {
    // Log the error for debugging
    console.error(`Error fetching data from ${url}:`, error);
    
    // Rethrow with a more descriptive message
    throw new Error(
      error.response?.data?.message || 
      "Failed to fetch data. Please try again."
    );
  }
};

export default fetchData;