"use client";

import { createContext, useState, useEffect } from "react";
import { customerService } from "../services/customer-api";

export const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkCustomerLoggedIn = async () => {
      try {
        console.log("Checking if customer is logged in...");
        const token = localStorage.getItem("customerToken");
        if (token) {
          const customerData = await customerService.getProfile();
          console.log("Customer data fetched:", customerData);
          setCustomer(customerData);
        }
      } catch (err) {
        console.error("Failed to fetch customer profile:", err);
        localStorage.removeItem("customerToken");
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };
    if (loading) checkCustomerLoggedIn();
  }, [loading]);

  // Register a new customer
  const register = async (name, email, password, phone, address) => {
    setError("");
    try {
      const result = await customerService.register({
        name,
        email,
        password,
        phone,
        address,
      });

      localStorage.setItem("customerToken", result.token);
      setCustomer(result.customer);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  // Login customer
  const login = async (email, password) => {
    setError("");
    try {
      const result = await customerService.login({ email, password });

      localStorage.setItem("customerToken", result.token);
      setCustomer(result.customer);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  // Logout customer
  const logout = () => {
    localStorage.removeItem("customerToken");
    setCustomer(null);
  };

  // Update customer profile
  const updateProfile = async (profileData) => {
    setError("");
    try {
      const updatedCustomer = await customerService.updateProfile(profileData);
      setCustomer(updatedCustomer);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update profile",
      };
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!customer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};
