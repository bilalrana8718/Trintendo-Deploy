"use client"

import { createContext, useState, useEffect } from "react"
import { api } from "../services/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          console.log('Loading user with token:', token);
          // Try to get rider profile first
          try {
            const riderResponse = await api.get("/rider/me");
            console.log('Load rider response:', riderResponse.data);
            setUser({
              ...riderResponse.data,
              role: 'rider'
            });
          } catch (riderError) {
            // If not a rider, try regular user profile
            const response = await api.get("/auth/me");
            console.log('Load user response:', response.data);
            setUser(response.data);
          }
        } catch (error) {
          console.error("Failed to load user:", error.response || error);
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password, role = 'customer') => {
    try {
      let endpoint = '/auth/login';
      if (role === 'rider') {
        endpoint = '/rider/login';
      }
      
      console.log('Attempting login:', {
        endpoint,
        email,
        role
      });

      const response = await api.post(endpoint, { email, password });
      console.log('Login response:', response.data);

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        
        // Handle rider login response differently
        if (role === 'rider' && response.data.rider) {
          setUser({
            ...response.data.rider,
            role: 'rider'
          });
        } else {
          setUser(response.data.user);
        }
        
        return { success: true };
      } else {
        console.error('Login response missing token:', response.data);
        return {
          success: false,
          message: "Invalid response from server"
        };
      }
    } catch (error) {
      console.error('Login error:', {
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please check your credentials.",
      };
    }
  };

  const register = async (name, email, password, role = 'customer', additionalData = {}) => {
    try {
      let endpoint = '/auth/register';
      let data = { name, email, password };
      
      if (role === 'rider') {
        endpoint = '/rider/register';
        data = {
          ...data,
          phone: additionalData.phone,
          vehicleType: additionalData.vehicleType,
          vehicleNumber: additionalData.vehicleNumber
        };
      }
      
      console.log('Attempting registration:', {
        endpoint,
        data: { ...data, password: '[REDACTED]' }
      });
      
      const response = await api.post(endpoint, data);
      console.log('Registration response:', {
        ...response.data,
        token: response.data.token ? '[TOKEN EXISTS]' : '[NO TOKEN]'
      });
      
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        console.error('Registration response missing token:', response.data);
        return {
          success: false,
          message: "Invalid response from server"
        };
      }
    } catch (error) {
      console.error('Registration error:', {
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed. Please try again.",
      };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
