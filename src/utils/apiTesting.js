import { useAuth, useAuthenticatedApi } from "../hooks/useAuth";

/**
 * Utility functions for testing API and JWT functionality
 */

// Test JWT decoding
export const testJWTDecoding = () => {
  // Example JWT token for testing (you can replace this with a real token)
  const testToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTksInVzZXJJZCI6ImRlbW8xMjMiLCJlbWFpbCI6ImRlbW9AZHJvbmVjcm9wLmNvbSIsInJvbGUiOiJ1c2VyIn0.1234567890";

  try {
    const { jwtDecode } = require("jwt-decode");
    const decoded = jwtDecode(testToken);
    console.log("Decoded JWT:", decoded);
    return decoded;
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
};

// Hook for testing authenticated API calls
export const useApiTesting = () => {
  const { isAuthenticated, userData, accessToken } = useAuth();
  const api = useAuthenticatedApi();

  const testEndpoints = {
    // Test getting user profile
    getUserProfile: async () => {
      try {
        const response = await api.get("/api/user/profile");
        const data = await response.json();
        console.log("User Profile:", data);
        return data;
      } catch (error) {
        console.error("Get profile error:", error);
        throw error;
      }
    },

    // Test getting user data
    getUserData: async () => {
      try {
        const response = await api.get("/api/user/data");
        const data = await response.json();
        console.log("User Data:", data);
        return data;
      } catch (error) {
        console.error("Get user data error:", error);
        throw error;
      }
    },

    // Test uploading image
    uploadImage: async (imageData) => {
      try {
        const response = await api.post("/api/upload/image", {
          image: imageData,
          timestamp: new Date().toISOString(),
        });
        const data = await response.json();
        console.log("Upload response:", data);
        return data;
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
      }
    },

    // Test getting analysis results
    getAnalysisResults: async () => {
      try {
        const response = await api.get("/api/analysis/results");
        const data = await response.json();
        console.log("Analysis Results:", data);
        return data;
      } catch (error) {
        console.error("Get analysis error:", error);
        throw error;
      }
    },
  };

  return {
    isAuthenticated,
    userData,
    accessToken,
    testEndpoints,

    // Debug function to log current auth state
    logAuthState: () => {
      console.log("=== Auth State ===");
      console.log("Is Authenticated:", isAuthenticated);
      console.log("User Data:", userData);
      console.log("Has Token:", !!accessToken);
      if (accessToken) {
        console.log("Token Preview:", accessToken.substring(0, 50) + "...");
      }
      console.log("==================");
    },
  };
};

// Helper function to create mock JWT token for testing
export const createMockJWT = (payload = {}) => {
  const header = { alg: "HS256", typ: "JWT" };
  const defaultPayload = {
    sub: "1234567890",
    name: "Test User",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    userId: "demo123",
    email: "demo@dronecrop.com",
    role: "user",
    ...payload,
  };

  // Base64 encode (for testing purposes only)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(defaultPayload));
  const signature = "mock_signature_for_testing";

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export default {
  testJWTDecoding,
  useApiTesting,
  createMockJWT,
};
