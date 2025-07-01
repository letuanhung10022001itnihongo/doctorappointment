/**
 * Converts a file to a Base64 encoded string
 * 
 * This utility function takes a file object (typically from an input element)
 * and converts it to a Base64 string representation that can be used for:
 * - Sending images in JSON payloads to APIs
 * - Previewing images before upload
 * - Storing images in localStorage or sessionStorage
 * 
 * @param {File} file - The file object to convert
 * @returns {Promise<string>} A promise that resolves with the Base64 string or rejects with an error
 */
export default function convertToBase64(file) {
  // Input validation
  if (!file || !(file instanceof File)) {
    return Promise.reject(new Error('Invalid file input'));
  }
  
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    
    // Set up event handlers before starting the read operation
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
    
    // Start the conversion process
    fileReader.readAsDataURL(file);
  });
}