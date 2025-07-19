import { createContext, useContext, useEffect, useState } from "react";
import SessionManager from "../../lib/sessionmanagemant";

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isValid = await SessionManager.isTokenValid();

      if (isValid) {
        const token = await SessionManager.getAccessToken();
        const user = await SessionManager.getUserData();

        setIsAuthenticated(true);
        setAccessToken(token);
        setUserData(user);
      } else {
        setIsAuthenticated(false);
        setAccessToken(null);
        setUserData(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setAccessToken(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email, userId) => {
    try {
      setIsLoading(true);
      const result = await SessionManager.login(email, userId);

      if (result.success) {
        setIsAuthenticated(true);
        setAccessToken(result.accessToken);
        setUserData(result.userData);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message || "Login failed" };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await SessionManager.logout();
      setIsAuthenticated(false);
      setAccessToken(null);
      setUserData(null);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Make authenticated API calls
  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    try {
      return await SessionManager.makeAuthenticatedRequest(endpoint, options);
    } catch (error) {
      // If token expired, update auth state
      if (error.message.includes("Token expired")) {
        setIsAuthenticated(false);
        setAccessToken(null);
        setUserData(null);
      }
      throw error;
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    try {
      const user = await SessionManager.getUserData();
      setUserData(user);
      return user;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };

  const value = {
    // State
    isAuthenticated,
    userData,
    isLoading,
    accessToken,

    // Methods
    login,
    logout,
    makeAuthenticatedRequest,
    refreshUserData,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Hook for making authenticated API calls
export const useAuthenticatedApi = () => {
  const { makeAuthenticatedRequest } = useAuth();

  return {
    get: (endpoint) => makeAuthenticatedRequest(endpoint, { method: "GET" }),
    post: (endpoint, data) =>
      makeAuthenticatedRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    put: (endpoint, data) =>
      makeAuthenticatedRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (endpoint) =>
      makeAuthenticatedRequest(endpoint, { method: "DELETE" }),
  };
};

export default useAuth;
