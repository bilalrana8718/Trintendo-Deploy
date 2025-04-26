import axios from 'axios';
import { API_URL } from '../config';
import authHeader from './auth-header';

const getRiderStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/rider/status`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateStatus = async (newStatus) => {
  try {
    console.log(`Updating rider status to: ${newStatus}`);
    const response = await axios.post(
      `${API_URL}/rider/status`, 
      { status: newStatus },
      { headers: authHeader() }
    );
    console.log("Status update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating rider status:", error);
    throw error;
  }
};

const getDeliveryRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/rider/delivery-requests`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const acceptDeliveryRequest = async (orderId) => {
  try {
    const response = await axios.post(`${API_URL}/rider/delivery-requests/${orderId}/accept`, {}, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const declineDeliveryRequest = async (orderId) => {
  try {
    const response = await axios.post(`${API_URL}/rider/delivery-requests/${orderId}/decline`, {}, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateLocation = async (latitude, longitude) => {
  try {
    const response = await axios.post(`${API_URL}/rider/location`, { latitude, longitude }, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getActiveDelivery = async () => {
  try {
    const response = await axios.get(`${API_URL}/rider/active-delivery`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateDeliveryStatus = async (orderId, status) => {
  try {
    console.log(`Updating order ${orderId} to status: ${status}`);
    const response = await axios.post(
      `${API_URL}/rider/active-delivery/${orderId}/status`,
      { status },
      { headers: authHeader() }
    );
    console.log("Update delivery status response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating delivery status:", error);
    throw error;
  }
};

const validStatusTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

export {
  getRiderStatus,
  updateStatus,
  getDeliveryRequests,
  acceptDeliveryRequest,
  declineDeliveryRequest,
  updateLocation,
  getActiveDelivery,
  updateDeliveryStatus,
}; 