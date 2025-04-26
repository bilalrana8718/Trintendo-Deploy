import axios from "axios";
import { API_URL } from "../config";

// Create axios instance with base URL
export const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Restaurant services
export const restaurantService = {
  getAllRestaurants: () => api.get("/restaurants"),
  getRestaurantById: (id) => api.get(`/restaurants/${id}`),
  getRestaurantsByCuisine: (cuisine) =>
    api.get(`/restaurants`, { params: { cuisine } }),
  getMyRestaurants: () => api.get("/restaurants/owner/me"),
  createRestaurant: (data) => api.post("/restaurants", data),
  updateRestaurant: (id, data) => api.patch(`/restaurants/${id}`, data),
  addMenuItem: (id, data) => api.post(`/restaurants/${id}/menu`, data),
  updateMenuItem: (restaurantId, itemId, data) =>
    api.patch(`/restaurants/${restaurantId}/menu/${itemId}`, data),
  deleteMenuItem: (restaurantId, itemId) =>
    api.delete(`/restaurants/${restaurantId}/menu/${itemId}`),
  getRestaurantOrders: () => api.get("/orders/restaurant"),
  updateOrderStatus: (orderId, data) => {
    console.log('Updating order status:', { orderId, data });
    console.log('Auth token:', localStorage.getItem("token"));
    return api.patch(`/orders/restaurant/${orderId}/status`, data)
      .catch(error => {
        console.error('Order status update error details:', {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
        throw error;
      });
  },
};

// Rider services
export const riderService = {
  getRiderStatus: async () => {
    try {
      const response = await api.get("/rider/status");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateStatus: async (status) => {
    try {
      const response = await api.post("/rider/status", status);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDeliveryRequests: async () => {
    try {
      const response = await api.get("/rider/delivery-requests");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getActiveDelivery: async () => {
    try {
      const response = await api.get("/rider/active-delivery");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  acceptDeliveryRequest: async (orderId) => {
    try {
      const response = await api.post(`/rider/delivery-requests/${orderId}/accept`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  declineDeliveryRequest: async (orderId) => {
    try {
      const response = await api.post(`/rider/delivery-requests/${orderId}/decline`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  completeDelivery: async (orderId) => {
    try {
      const response = await api.post(`/rider/delivery-requests/${orderId}/complete`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateLocation: async (location) => {
    try {
      const response = await api.post("/rider/location", location);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDeliveryStatus: async (orderId, data) => {
    try {
      const response = await api.post(`/rider/delivery-requests/${orderId}/status`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
