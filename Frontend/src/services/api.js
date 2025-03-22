import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
  updateOrderStatus: (orderId, data) =>
    api.patch(`/orders/restaurant/${orderId}/status`, data),
};
