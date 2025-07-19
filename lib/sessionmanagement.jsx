import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const JWT_SECRET = process.env.EXPO_PUBLIC_JWT_TOKEN;

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  USER_DATA: "user_data",
  REFRESH_TOKEN: "refresh_token",
};

// Session Management Class
class SessionManager {
  constructor() {
    this.token = null;
    this.userData = null;
  }

  // Login API call
  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          mobileId: credentials.userId, // Using userId as mobileId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      if (data.accessToken) {
        // Store the access token
        await this.setToken(data.accessToken);

        // Decode JWT and store user data
        const decodedToken = this.decodeToken(data.accessToken);
        await this.setUserData(decodedToken);

        // Store refresh token if available
        if (data.refreshToken) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            data.refreshToken
          );
        }

        return {
          success: true,
          token: data.accessToken,
          userData: decodedToken,
          message: data.message || "Login successful",
        };
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
      };
    }
  }

  // Decode JWT token
  decodeToken(token) {
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error("Token decode error:", error);
      return null;
    }
  }

  // Verify token validity
  isTokenValid(token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  // Store access token
  async setToken(token) {
    try {
      this.token = token;
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      return true;
    } catch (error) {
      console.error("Error storing token:", error);
      return false;
    }
  }

  // Get stored token
  async getToken() {
    try {
      if (this.token) return this.token;

      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && this.isTokenValid(token)) {
        this.token = token;
        return token;
      } else {
        // Token expired or invalid, clear it
        await this.clearToken();
        return null;
      }
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  // Store user data
  async setUserData(userData) {
    try {
      this.userData = userData;
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData)
      );
      return true;
    } catch (error) {
      console.error("Error storing user data:", error);
      return false;
    }
  }

  // Get stored user data
  async getUserData() {
    try {
      if (this.userData) return this.userData;

      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        this.userData = JSON.parse(userData);
        return this.userData;
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }

  // Get authenticated headers for API calls
  async getAuthHeaders() {
    const token = await this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
      );
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      if (data.accessToken) {
        await this.setToken(data.accessToken);
        const decodedToken = this.decodeToken(data.accessToken);
        await this.setUserData(decodedToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      await this.logout();
      return false;
    }
  }

  // Clear token
  async clearToken() {
    try {
      this.token = null;
      await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      return true;
    } catch (error) {
      console.error("Error clearing token:", error);
      return false;
    }
  }

  // Clear user data
  async clearUserData() {
    try {
      this.userData = null;
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return true;
    } catch (error) {
      console.error("Error clearing user data:", error);
      return false;
    }
  }

  // Logout
  async logout() {
    try {
      // Optional: Call logout API
      const token = await this.getToken();
      if (token) {
        try {
          await fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            headers: await this.getAuthHeaders(),
          });
        } catch (error) {
          console.error("Logout API error:", error);
        }
      }

      // Clear all stored data
      await Promise.all([
        this.clearToken(),
        this.clearUserData(),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }

  // Make authenticated API call
  async makeAuthenticatedRequest(endpoint, options = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // If token expired, try to refresh
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the request with new token
          const newHeaders = await this.getAuthHeaders();
          return await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
              ...newHeaders,
              ...options.headers,
            },
          });
        } else {
          // Refresh failed, redirect to login
          await this.logout();
          throw new Error("Session expired");
        }
      }

      return response;
    } catch (error) {
      console.error("Authenticated request error:", error);
      throw error;
    }
  }
}

// Export singleton instance
const sessionManager = new SessionManager();
export default sessionManager;

// Export utility functions
export const {
  login,
  logout,
  getToken,
  getUserData,
  isAuthenticated,
  makeAuthenticatedRequest,
  getAuthHeaders,
  decodeToken,
  isTokenValid,
} = sessionManager;
