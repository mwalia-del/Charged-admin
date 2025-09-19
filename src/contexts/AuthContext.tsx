import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  AuthState,
  Driver,
  Rider,
  DriverDocumentpayload,
  Driverstatuspayload,
  requiredDocuments,
  rideTypes,
  Ride,
  DashboardStats,
  Reward,
  CreateRewardBody,
  ChangeRewardPointsBody,
  RewardPointDetail,
  createDocumentType,
} from "../types";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import {
  getAdmin,
  getDriversdata,
  getridersdata,
  getRidetypesdata,
  getDashboardStatsData,
  getDriverdocsdata,
  updateDriverDocs,
  updateDriverstatus,
  getDocumenttypesdata,
  updateRidetypedata,
  getRecentRidesData,
  getRidesDataByUserId,
  getRewards,
  createReward,
  deleteReward,
  getRewardPoints,
  changeRewardPoints,
  deleteRewardPoints,
  deleteUser,
  deleteDocument,
  createDocumenttype,
  updateDocumenttype,
} from "../API/axios";
// Removed unifiedMockData imports - using real API only
// Using direct API calls instead of wrapper
import toast from "react-hot-toast";

interface AuthContextType {
  authState: AuthState;
  isAuthenticated: boolean;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  getDrivers: () => Promise<Driver[]>;
  getDriverDocs: (id: string) => Promise<any>;
  updateDriverdocsStatus: (
    driverId: string,
    documentId: string,
    data: DriverDocumentpayload,
  ) => Promise<any>;
  updateDriveractivestatus: (
    driverId: string,
    data: Driverstatuspayload,
    setError: any,
  ) => Promise<any>;
  getDocumenttypes: () => Promise<requiredDocuments[]>;
  deleteExistingDocument: (documentId: string) => Promise<void>;
  createNewDocument: (data: createDocumentType) => Promise<requiredDocuments>;
  updateExistingDocument: (
    documentId: string,
    data: Partial<createDocumentType>,
  ) => Promise<requiredDocuments>;
  getRiders: () => Promise<Rider[]>;
  getRidetypes: () => Promise<rideTypes[]>;
  updateRidetype: (id: number, body: object) => Promise<any>;
  getrecentRides: () => Promise<Ride[]>;
  getRidesByUserId: (id: number) => Promise<Ride[]>;
  getDashboardStats: () => Promise<DashboardStats>;
  getRewardsData: () => Promise<any>;
  createNewReward: (data: CreateRewardBody) => Promise<Reward>;
  deleteExistingReward: (Id: number) => Promise<void>;
  getRewardPointsData: (id: number) => Promise<RewardPointDetail[]>;
  updateRewardPoints: (
    id: number,
    data: ChangeRewardPointsBody,
  ) => Promise<void>;
  deleteExistingRewardPoints: (id: number) => Promise<void>;
  deleteExistingUser: (id: string) => Promise<void>;
  logout: () => void;
}

const initialAuthState: AuthState = {
  user: null,
  error: null,
};

const AuthContext = createContext<AuthContextType>({
  authState: initialAuthState,
  setAuthState: () => {},
  isAuthenticated: false,
  loading: false,
  login: async () => {},
  getDrivers: async () => {
    return [];
  },
  getDriverDocs: async () => {
    return [];
  },
  updateDriverdocsStatus: async () => {
    return [];
  },
  updateDriveractivestatus: async () => {
    return [];
  },
  getDocumenttypes: async () => {
    return [];
  },
  deleteExistingDocument: async () => {},
  createNewDocument: async (
    data: createDocumentType,
  ): Promise<requiredDocuments> => {
    return {} as requiredDocuments;
  },
  updateExistingDocument: async (
    documentId: string,
    data: Partial<createDocumentType>,
  ): Promise<requiredDocuments> => {
    return {} as requiredDocuments;
  },
  getRiders: async () => {
    return [];
  },
  getRidetypes: async () => {
    return [];
  },
  updateRidetype: async () => {
    return [];
  },
  getrecentRides: async () => {
    return [];
  },
  getRidesByUserId: async (Id: number) => {
    return [];
  },
  getDashboardStats: async () => {
    return {
      rideCount: "0",
      activeDrivers: "0",
      totalRevenue: "0",
      platformCommission: "0",
      rideTypeCounts: [],
    };
  },
  getRewardsData: async () => {
    return [];
  },
  createNewReward: async (data: CreateRewardBody) => {
    return {
      id: 1,
      title: "anything",
      description: "anything",
      point_required: 100,
      created_at: "Date",
      updated_at: "Date",
    };
  },
  deleteExistingReward: async (Id: number) => {
    return;
  },
  getRewardPointsData: async (id: number) => {
    return [];
  },
  updateRewardPoints: async (id: number, data: ChangeRewardPointsBody) => {
    return;
  },
  deleteExistingRewardPoints: async (id: number) => {
    return;
  },
  deleteExistingUser: async (id: string) => {
    return;
  },
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [loading, setLoading] = useState<boolean>(false);

  // Simplified session check - no async operations that could cause loops
  useEffect(() => {
    console.log("🔍 Checking existing session...");
    setLoading(true); // Set loading to true during session check
    
    try {
      const userData = localStorage.getItem("charged_admin_user");
      console.log("🔍 User data found:", !!userData);

      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log("🔍 Parsed user:", parsedUser);
        setAuthState({
          user: parsedUser,
          error: null,
        });
      } else {
        console.log("🔍 No user data found, setting to null");
        setAuthState({
          user: null,
          error: null,
        });
      }
    } catch (error) {
      console.error("❌ Error restoring session:", error);
      setAuthState({
        user: null,
        error: null,
      });
    } finally {
      setLoading(false); // Set loading to false after session check is complete
    }
  }, []);

  // Simplified token refresh - disabled to prevent loops
  useEffect(() => {
    console.log("🔄 Token refresh mechanism disabled to prevent loops");
  }, []);

  const handleExpiredtoken = (error: any) => {
    if (
      "auth/id-token-expired" === error?.response?.data?.error?.code ||
      "auth/argument-error" === error?.response?.data.error?.code
    ) {
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Real Firebase authentication
      const userCredential: any = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Get the Firebase ID token for API calls
      const idToken = await userCredential.user.getIdToken();
      
      const User: User = {
        token: idToken,
        id: userCredential.user?.uid,
        name: userCredential.user?.displayName || "Admin",
        email: userCredential.user?.email || email,
        role: "admin",
        createdAt: userCredential.user?.metadata.creationTime,
        photo: userCredential.user?.photoURL || "",
      };

      // Check if the user exists and is an admin
      if (userCredential.user) {
        try {
          const userData = await getAdmin(User.token || "");
          //Check if the user is an admin
          if (userData?.data?.data?.user_type !== "admin") {
            setAuthState({
              user: null,
              error: "Enter a valid Admin Credentials",
            });
            return;
          }

          setAuthState({
            user: User,
            error: null,
          });

          toast.success(`${User.name} login successfully!`);
          localStorage.setItem("charged_admin_user", JSON.stringify(User));
        } catch (apiError) {
          // SECURITY FIX: Fail secure - require successful verification
          console.error('Admin verification failed:', apiError);
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: 'Admin verification failed. Please contact support.',
          });
          toast.error('Admin verification failed. Please contact support.');
          return;
        }
      }
    } catch (error) {
      const errorCases: any = {
        "auth/invalid-credential": "Invalid credentials. Please try again.",
        "auth/user-not-found": "No user found with this email.",
        "auth/user-disabled": "This user account has been disabled.",
        "auth/too-many-requests": "Too many failed attempts. Please try again later.",
        "auth/network-request-failed": "Network error. Please check your connection.",
        "auth/invalid-email": "Invalid email address format.",
        "auth/weak-password": "Password is too weak.",
        "auth/email-already-in-use": "Email is already in use.",
        "auth/operation-not-allowed": "This operation is not allowed.",
        "auth/requires-recent-login": "Please log in again to complete this action.",
      };
      
      const errorMessage = errorCases[(error as any).code] || `Login failed: ${(error as any).message || "Unknown error"}`;
      
      setAuthState({
        user: null,
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to get drivers

  const getDrivers = async (): Promise<any> => {
    try {
      console.log('🌐 Attempting to fetch drivers from API...');
      const drivers: any = await getDriversdata();
      console.log('✅ API response received:', drivers);
      
      // Handle different response structures
      const driversData = drivers?.data?.data || drivers?.data || drivers || [];
      console.log('📊 Processed drivers data:', driversData.length, 'drivers');
      
      if (driversData.length > 0) {
        return driversData;
      } else {
        console.warn('⚠️ API returned empty drivers array');
        return [];
      }
    } catch (error: any) {
      console.error('❌ API call failed:', error);
      handleExpiredtoken(error);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
      // Return empty array as fallback
      console.warn('🎭 No drivers data available');
      return [];
    }
  };

  // Function to get driver documents
  const getDriverDocs = async (id: string): Promise<any> => {
    try {
      const driverDocs: any = await getDriverdocsdata(id);
      return driverDocs?.data?.data || driverDocs?.data || driverDocs || [];
    } catch (error: any) {
      handleExpiredtoken(error);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
      return []; // Return empty array on error
    }
  };

  // Function to update driver documents

  const updateDriverdocsStatus = async (
    driverId: string,
    documentId: string,
    data: DriverDocumentpayload,
  ): Promise<any> => {
    try {
      const driverDocs: any = await updateDriverDocs(
        driverId,
        documentId,
        data,
      );
      toast.success(driverDocs.data?.message);
      return (driverDocs?.data?.data as any)?.[0] || (driverDocs?.data as any)?.[0] || (driverDocs as any)?.[0] || {};
    } catch (error: any) {
      handleExpiredtoken(error);
      toast.error(error.data?.message);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
    }
  };

  const updateDriveractivestatus = async (
    driverId: string,
    data: Driverstatuspayload,
    setError: any,
  ): Promise<any> => {
    try {
      const driverStatus = await updateDriverstatus(driverId, data);
      toast.success(
        `Driver updated to ${data.is_active ? "active" : "inactive"} successfully`,
      );
      return (driverStatus?.data?.data as any)?.[0] || (driverStatus?.data as any)?.[0] || (driverStatus as any)?.[0] || {};
    } catch (error: any) {
      toast.error(error.response.data?.message);
      setError(error.response?.data?.message || error.message);
      handleExpiredtoken(error);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
    }
  };

  const getDocumenttypes = async (): Promise<any> => {
    try {
      const documentTypes = await getDocumenttypesdata();
      return documentTypes?.data?.data || documentTypes?.data || documentTypes || [];
    } catch (error: any) {
      handleExpiredtoken(error);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
      return []; // Return empty array on error
    }
  };

  const deleteExistingDocument = async (documentId: string): Promise<void> => {
    try {
      const deletedDocument = await deleteDocument(documentId);
      toast.success(deletedDocument.data?.message);
    } catch (error: any) {
      if (error?.message) {
        toast.error(error.message);
        return;
      }
      toast.error(error.data?.message);
      handleExpiredtoken(error);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
    }
  };

  // Function to get Riders
  const getRiders = async (): Promise<any> => {
    try {
      console.log('🌐 Attempting to fetch riders from API...');
      const riders: any = await getridersdata();
      console.log('✅ API response received:', riders);
      
      // Handle different response structures
      const ridersData = riders?.data?.data || riders?.data || riders || [];
      console.log('📊 Processed riders data:', ridersData.length, 'riders');
      
      if (ridersData.length > 0) {
        return ridersData;
      } else {
        console.warn('⚠️ API returned empty riders array');
        return [];
      }
    } catch (error: any) {
      console.error('❌ API call failed:', error);
      handleExpiredtoken(error);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
      // Return empty array as fallback
      console.warn('🎭 No riders data available');
      return [];
    }
  };

  const getRidetypes = async (): Promise<any> => {
    try {
      const rideTypes = await getRidetypesdata();
      return rideTypes?.data?.data || rideTypes?.data || rideTypes || [];
    } catch (error: any) {
      handleExpiredtoken(error);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
      return []; // Return empty array on error
    }
  };

  const updateRidetype = async (id: number, body: object): Promise<any> => {
    try {
      await updateRidetypedata(id, body);
    } catch (error: any) {
      handleExpiredtoken(error);
      toast.error(error.data?.message);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
    }
  };

  const getrecentRides = async (): Promise<any> => {
    // Don't make API calls if user is not authenticated
    if (!authState.user) {
      console.log("🚗 Skipping recent rides - user not authenticated");
      return [];
    }

    try {
      const recentRides = await getRecentRidesData();
      return recentRides?.data?.data || recentRides?.data || recentRides || [];
    } catch (error: any) {
      // Only handle token expiration if it's actually a token error
      if (error?.response?.data?.error?.code === "auth/id-token-expired" || 
          error?.response?.data?.error?.code === "auth/argument-error") {
        handleExpiredtoken(error);
      }
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
      return [];
    }
  };

  const getRidesByUserId = async (Id: number): Promise<any> => {
    try {
      const RidesByUserId = await getRidesDataByUserId(Id);
      return RidesByUserId?.data?.data || RidesByUserId?.data || RidesByUserId || [];
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
      return error.response?.data?.status || 0;
    }
  };

  const getDashboardStats = async (): Promise<any> => {
    // Don't make API calls if user is not authenticated
    if (!authState.user) {
      console.log("📊 Skipping dashboard stats - user not authenticated");
      return {
        rideCount: "0",
        activeDrivers: "0",
        totalRevenue: "0.00",
        platformCommission: "0.00",
        rideTypeCounts: []
      };
    }

    console.log("📊 Loading dashboard stats...");
    try {
      const dashboardStats = await getDashboardStatsData();
      console.log("📊 Dashboard stats API response:", dashboardStats);
      const data = dashboardStats.data?.data || dashboardStats;
      console.log("📊 Processed dashboard data:", data);
      return data;
    } catch (error: any) {
      console.error("❌ Dashboard stats error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Only handle token expiration if it's actually a token error
      if (error?.response?.data?.error?.code === "auth/id-token-expired" || 
          error?.response?.data?.error?.code === "auth/argument-error") {
        handleExpiredtoken(error);
      }
      
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
      return {
        rideCount: "0",
        activeDrivers: "0",
        totalRevenue: "0",
        platformCommission: "0",
        rideTypeCounts: [],
      }; // Return default stats on error
    }
  };

  const getRewardsData = async (): Promise<any> => {
    try {
      const Rewards = await getRewards();
      return Rewards?.data?.data || Rewards?.data || Rewards || [];
    } catch (error: any) {
      handleExpiredtoken(error);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
      return []; // Return empty array on error
    }
  };

  const createNewReward = async (data: CreateRewardBody): Promise<any> => {
    try {
      const newReward = await createReward(data);
      toast.success(newReward.data?.message);
      return newReward?.data?.data || newReward?.data || newReward || {};
    } catch (error: any) {
      handleExpiredtoken(error);
      toast.error(error.data?.message);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
    }
  };

  const deleteExistingReward = async (rewardId: number): Promise<any> => {
    try {
      const deletedReward = await deleteReward(rewardId);
      toast.success(deletedReward.data?.message);
      return deletedReward?.data?.data || deletedReward?.data || deletedReward || {};
    } catch (error: any) {
      handleExpiredtoken(error);
      toast.error(error.data?.message);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
    }
  };

  const getRewardPointsData = async (userId: number): Promise<any> => {
    try {
      const rewardPoints = await getRewardPoints(userId);
      return rewardPoints.data.data?.rewards;
    } catch (error: any) {
      handleExpiredtoken(error);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
    }
  };

  const updateRewardPoints = async (
    userId: number,
    data: ChangeRewardPointsBody,
  ) => {
    try {
      const changedRewardPoints = await changeRewardPoints(userId, data);
      toast.success(changedRewardPoints.data?.message);
    } catch (error: any) {
      handleExpiredtoken(error);
      toast.error(error.data?.message);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
    }
  };

  const createNewDocument = async (
    data: createDocumentType,
  ): Promise<requiredDocuments> => {
    try {
      const newDocument = await createDocumenttype(data);
      toast.success(newDocument.data?.message);
      return newDocument?.data?.data || newDocument?.data || newDocument || {};
    } catch (error: any) {
      handleExpiredtoken(error);
      toast.error(error.data?.message);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
      throw error;
    }
  };

  const updateExistingDocument = async (
    documentId: string,
    data: Partial<createDocumentType>,
  ): Promise<requiredDocuments> => {
    try {
      const updatedDocument = await updateDocumenttype(documentId, data);
      toast.success(updatedDocument.data?.message);
      return updatedDocument?.data?.data || updatedDocument?.data || updatedDocument || {};
    } catch (error: any) {
      handleExpiredtoken(error);
      toast.error(error.data?.message);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
      throw error;
    }
  };

  const deleteExistingRewardPoints = async (rewardPointId: number) => {
    try {
      const deletedRewardPoints = await deleteRewardPoints(rewardPointId);
      toast.success(deletedRewardPoints.data?.message);
    } catch (error: any) {
      handleExpiredtoken(error);
      toast.error(error.data?.message);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
    }
  };

  const deleteExistingUser = async (userId: string) => {
    try {
      const deletedUser = await deleteUser(userId);
      toast.success(deletedUser.data?.message);
    } catch (error: any) {
      handleExpiredtoken(error);
      toast.error(error.data?.message);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
      }));
    }
  };

  const logout = () => {
    // Clear user data from localStorage
    signOut(auth);
    localStorage.removeItem("charged_admin_user");
    toast.success("Logout succesfully");
    // Reset auth state
    setAuthState(initialAuthState);
  };

  const isAuthenticated = !!authState.user;

  return (
    <AuthContext.Provider
      value={{
        authState,
        setAuthState,
        isAuthenticated,
        loading,
        login,
        getDrivers,
        getDriverDocs,
        getDocumenttypes,
        deleteExistingDocument,
        updateDriverdocsStatus,
        updateDriveractivestatus,
        getRidetypes,
        getRiders,
        updateRidetype,
        getrecentRides,
        getRidesByUserId,
        getDashboardStats,
        getRewardsData,
        createNewReward,
        deleteExistingReward,
        getRewardPointsData,
        updateRewardPoints,
        deleteExistingRewardPoints,
        deleteExistingUser,
        createNewDocument,
        updateExistingDocument,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
