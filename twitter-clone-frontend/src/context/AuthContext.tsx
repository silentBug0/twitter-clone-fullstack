import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

// Define the shape of a user object (adjust based on your backend user structure)
interface User {
  id: string;
  username: string;
  email: string;
  // Add other user properties like displayName, bio if available
}

// Define the shape of the AuthContext
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Create the context with a default null value
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component to wrap your application
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const navigate = useNavigate();

  // We are going to wrap these functions in useCallback to memoize them.
  // This is the key change to solve the ESLint warning.

  // Logout function
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]); // The logout function depends on the navigate function

  // Function to fetch current user data after successful token acquisition
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await axiosInstance.get<User>("/users/me"); // Assuming you'll add this endpoint
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      logout(); // If fetching fails, the token might be invalid, so we log out
    }
  }, [logout]); // The fetchCurrentUser function depends on the logout function

  const login = useCallback(
    (newToken: string, userData: User) => {
      setToken(newToken);
      setUser(userData);
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/home");
    },
    [navigate]
  );

  useEffect(() => {
    if (token) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // If token exists but user data doesn't, try to fetch user data
          fetchCurrentUser();
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        logout(); // Clear invalid data
      }
    }
  }, [token, fetchCurrentUser, logout]); // Add the memoized functions to the dependency array

  const contextValue = {
    user,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
