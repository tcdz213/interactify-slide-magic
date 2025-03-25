
import axios from "axios";

// Base API URL - replace with your actual API URL in production
const API_URL = "http://localhost:3000"; // Change this to your actual API URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export { API_URL, api };
export default api;
