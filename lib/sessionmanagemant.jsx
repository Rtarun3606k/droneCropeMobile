import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "access_token";
const USER_DATA_KEY = "user_data";

// API Base URL from environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Session Management Utilities
 */
export class SessionManager {
  // Store access token
  static async setAccessToken(token) {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);

      // Decode and store user data
      const decodedToken = jwtDecode(token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(decodedToken));

      return true;
    } catch (error) {
      console.error("Error storing access token:", error);
      return false;
    }
  }

  // Get access token
  static async getAccessToken() {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  // Get decoded user data
  static async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  // Check if token is valid and not expired
  static async isTokenValid() {
    try {
      const token = await this.getAccessToken();
      if (!token) return false;

      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Check if token is expired
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        await this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating token:", error);
      await this.clearSession();
      return false;
    }
  }

  // Clear all session data
  static async clearSession() {
    try {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, USER_DATA_KEY]);
      return true;
    } catch (error) {
      console.error("Error clearing session:", error);
      return false;
    }
  }

  // Login API call
  static async login(email, mobileId) {
    try {
      // Add validation before API call
      if (!email || !email.trim()) {
        throw new Error("Email is required for login.");
      }

      if (!mobileId || !mobileId.trim()) {
        throw new Error("Mobile ID is required for login.");
      }

      console.log("Login attempt:", { email, mobileId }); // Debug log

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          mobileId: mobileId.trim(), // Using mobileId as userId
        }),
        //        "email":"r.tarunnayaka25042005@gmail.com",
        // "mobileId":"tarun123"
      });

      console.log("Login response status:", response.status, email, mobileId); // Debug log

      const data = await response.json();
      console.log("API Response:", data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.accessToken) {
        await this.setAccessToken(data.accessToken);
        return {
          success: true,
          accessToken: data.accessToken,
          userData: jwtDecode(data.accessToken),
        };
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  }

  // Logout
  static async logout() {
    try {
      // Optional: Call logout API endpoint if you have one
      // await fetch(`${API_BASE_URL}/api/auth/logout`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${await this.getAccessToken()}`,
      //   },
      // });

      await this.clearSession();
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }

  // Make authenticated API calls
  static async makeAuthenticatedRequest(endpoint, options = {}) {
    try {
      const token = await this.getAccessToken();

      if (!token || !(await this.isTokenValid())) {
        throw new Error("No valid token available");
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        await this.clearSession();
        throw new Error("Token expired. Please login again.");
      }

      return response;
    } catch (error) {
      console.error("Authenticated request error:", error);
      throw error;
    }
  }
}

export default SessionManager;
