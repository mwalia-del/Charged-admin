import axios from "axios";
import {
  ChangeRewardPointsBody,
  CreateRewardBody,
  DriverDocumentpayload,
  Driverstatuspayload,
} from "../types";

// This file contains the API calls for the admin panel

const instance = axios.create({
  baseURL: "https://api.charged.autos",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to dynamically set the Authorization header
instance.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem("charged_admin_user");
    if (userString) {
      const user = JSON.parse(userString);
      const token = user?.token;
      console.log("🔑 Sending token with request:", token ? "Yes" : "No");
      console.log("🔑 Token preview:", token ? `${token.substring(0, 20)}...` : "None");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      console.log("❌ No user found in localStorage");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to log API responses and handle token refresh
instance.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error("❌ API Error:", error.response?.status, error.config?.url);
    console.error("❌ Error details:", error.response?.data);
    
    // Handle 401 errors by refreshing token
    if (error.response?.status === 401) {
      const userString = localStorage.getItem("charged_admin_user");
      if (userString) {
        const user = JSON.parse(userString);
        console.log("🔄 Attempting to refresh token due to 401 error");
        
        // Try to refresh the token
        try {
          const { auth } = await import("../firebase/firebaseConfig");
          if (auth.currentUser) {
            const newToken = await auth.currentUser.getIdToken(true);
            const updatedUser = { ...user, token: newToken };
            localStorage.setItem("charged_admin_user", JSON.stringify(updatedUser));
            
            // Retry the original request with new token
            error.config.headers.Authorization = `Bearer ${newToken}`;
            console.log("🔄 Retrying request with refreshed token");
            return instance.request(error.config);
          }
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          // Redirect to login or clear user data
          localStorage.removeItem("charged_admin_user");
          window.location.href = "/login";
        }
      }
    }
    
    return Promise.reject(error);
  },
);

// Api to get admin data
// This API is used to get the admin data
// It takes the token as a parameter
// and returns the admin data

export const getAdmin = (token: string) =>
  instance.get("/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Api to get all drivers
// This API is used to get all drivers
// It returns an array of drivers
// It is used in the Drivers component

export const getDriversdata = () => instance.get("/admin/getdrivers");

// Api to get driver documents
// This API is used to get the driver documents
// It takes the driverId as a parameter
// and returns array of the driver documents

export const getDriverdocsdata = (id: string) =>
  instance.get(`/admin/getdriverdocs/${id}`);

// Api to update driver documents
// This API is used to update the driver documents
// It takes the driverId and documentId as parameters
// and the data to be updated as the request body
// It returns the updated driver documents
// It is used in the DriverDocuments component

export const updateDriverDocs = (
  driverId: string,
  documentId: string,
  data: DriverDocumentpayload,
) => instance.put(`/admin/verifydriverdoc/${driverId}/${documentId}`, data);

// Api to get update driver status
// It is used in the Drivers component

export const updateDriverstatus = (
  driverId: string,
  data: Driverstatuspayload,
) => {
  return instance.put(`/admin/updatestatus/${driverId}`, data);
};

// Api to get all document types
// This API is used to get all document types
// It returns an array of document types
// It is used in the documents component

export const getDocumenttypesdata = () => instance.get("/admin/documenttypes");

// Api to create a new document type
// This API is used to create a new document type
// It takes the document type data as the request body
// It returns the created document type
// It is used in the documents component

export const createDocumenttype = (body: object) =>
  instance.post("/admin/documenttypes", body);

//api to update a document type
// This API is used to update a document type
// It takes the document type id and the updated data as parameters
// It returns the updated document type
// It is used in the documents component
export const updateDocumenttype = (id: string, body: object) =>
  instance.put(`/admin/documenttypes/${id}`, body);

// Api to delete a document type
// This API is used to delete a document type
// It takes the document type id as a parameter
// It returns the result of the delete operation
// It is used in the documents component

export const deleteDocument = (documentId: string) =>
  instance.delete(`/admin/documenttypes/${documentId}`);

// Api to get all riders
// This API is used to get all riders
// It returns an array of riders
// It is used in the Riders component

export const getridersdata = () => instance.get("/admin/getriders");

// Api to get all Ridetypes
// This API is used to get all ridetypes
// It returns an array of ridetypes
// It is used in the pricing component

export const getRidetypesdata = () => instance.get("/ride/ridetype");

// Api to update Ridetype
// This API is used to update a particular ridetypes
// It returns result of task
// It is used in the pricing component

export const updateRidetypedata = (id: number, body: object) =>
  instance.put(`/ride/ridetype/${id}`, body);

// Api to get Rides
// This API is used to get all rides
// It returns the array of rides
// It is used in the dashboard page

export const getRecentRidesData = () => instance.get("/admin/ride/fetchlatest");

// Api to get rides data on basis of userId
// It returns the array of rides
// It is used in the riders and drivers page

export const getRidesDataByUserId = (userId: number) =>
  instance.get(`/admin/ride/userrides/${userId}`);

// Api to get specific ride details
// This API is used to get detailed information about a specific ride
// It takes the rideId as a parameter
// and returns the ride details

export const getRideDetails = (rideId: string) =>
  instance.get(`/admin/ride/fetchride/${rideId}`);

// Api to get driver details by ID
// This API is used to get driver information by ID
// It takes the driverId as a parameter
// and returns the driver details

export const getDriverDetails = (driverId: string) =>
  instance.get(`/ride/fetchdriver/${driverId}`);

// Api to get rider details by ID
// This API is used to get rider information by ID
// It takes the riderId as a parameter
// and returns the rider details

export const getRiderDetails = (riderId: string) =>
  instance.get(`/ride/fetchrider/${riderId}`);

// Api to get dashboard Stats
// This API is used to get all dashboard data
// It returns the object of dashboard stats
// It is used in the dashboard page

export const getDashboardStatsData = () =>
  instance.get("/admin/dashboardstats");

// Api to get all rewards
// This API is used to get all rewards
// It returns an array of rewards
// It is used in the Rewards component

export const getRewards = () => instance.get("/admin/rewards");

// Api to create a new reward
// This API is used to create a new reward
// It takes the reward data as the request body
// It returns the created reward
// It is used in the Rewards component

export const createReward = (data: CreateRewardBody) =>
  instance.post("/admin/rewards", data);

// Api to delete a reward
// This API is used to delete a reward
// It takes the reward id as a parameter
// It returns the result of the delete operation
// It is used in the Rewards component

export const deleteReward = (rewardId: number) =>
  instance.delete(`/admin/rewards/${rewardId}`);

// Api to get reward points of a user
// This API is used to get reward points of a user
// It takes the user id as a parameter
// It returns the reward points of the user
// It is used in the Rewards component

export const getRewardPoints = (userId: number) =>
  instance.get(`/admin/rewardpoints/${userId}`);

// Api to change reward points of a user
// This API is used to change reward points of a user
// It takes the user id and the data to be updated as parameters
// It returns the updated reward points of the user
// It is used in the Rewards component

export const changeRewardPoints = (
  userId: number,
  data: ChangeRewardPointsBody,
) => instance.post(`/admin/rewardpoints/${userId}`, data);

// Api to delete reward points of a user
// This API is used to delete reward points of a user
// It takes the reward point id as a parameter
// It returns the result of the delete operation
// It is used in the Rewards component

export const deleteRewardPoints = (rewardPointId: number) =>
  instance.delete(`/admin/rewardpoints/${rewardPointId}`);

// Api to delete a user
// This API is used to delete a user
// It takes the user id as a parameter
// It returns the result of the delete operation
// It is used in the Riders and Drivers component

export const deleteUser = (userId: string) =>
  instance.delete(`/admin/deleteusers/${userId}`);

// ===== WALLET MANAGEMENT ENDPOINTS =====

// Api to get wallet balance
// This API is used to get wallet balance (admin access)
// It returns the wallet balance information

export const getWalletBalance = () => instance.get("/wallet/balance");

// Api to get wallet transactions
// This API is used to get all wallet transactions
// It takes optional query parameters for filtering
// It returns paginated wallet transactions

export const getWalletTransactions = (params?: {
  user_id?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.user_id) queryParams.append('user_id', params.user_id);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return instance.get(`/wallet/transactions?${queryParams.toString()}`);
};

// Api to request payout
// This API is used to process payout request
// It takes payout data as request body
// It returns the result of the payout request

export const requestPayout = (data: {
  amount: number;
  currency?: string;
  payment_method?: string;
  notes?: string;
}) => instance.post("/wallet/payout", data);

// Api to get all payouts
// This API is used to get all payout requests
// It takes optional query parameters for filtering
// It returns paginated payout requests

export const getPayouts = (params?: {
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return instance.get(`/wallet/payouts?${queryParams.toString()}`);
};
