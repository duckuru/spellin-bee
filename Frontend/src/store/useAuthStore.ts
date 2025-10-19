import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

interface User {
  _id: string;
  email: string;
  username: string;
  profilePic?: string;
}

interface UserData {
  rank: string;
  mmr: number;
  level: number;
  hasAds: boolean;
}

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string; // optional, backend may ignore
}

interface LoginFormData {
  email: string;
  password: string;
}

interface MatchPlayer {
  userId: string;
  username: string;
  rank: string;
  score: number;
  mmrChange: number;
  isActive: boolean;
}

interface Match {
  _id: string;
  room_id: string;
  players: MatchPlayer[];
  createdAt: string;
}

interface History {
  _id: string;
  room_id: string;
  userId: string;
  mmrChange: number;
  rank: string;
  points: number;
  createdAt: string;
  username: string;
}

interface AuthState {
  authUser: User | null;
  userData: UserData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfileImage: boolean;
  socket: Socket | null;
  onlineUsers: string[];

  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  signup: (data: SignupFormData) => void;
  login: (data: LoginFormData) => void;
  logout: () => void;
  updateHasAds: () => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;

  myMatches: Match[];
  isLoadingMatches: boolean;
  fetchMyMatches: () => Promise<void>;
  myHistory: History[];
  isLoadingHistory: boolean;
  fetchMyHistory: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  userData: null,
  isLoggedIn: false,
  isLoading: false,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfileImage: false,
  socket: null,
  onlineUsers: [],
  myMatches: [],
  isLoadingMatches: false,
  myHistory: [],
  isLoadingHistory: false,

  // ✅ Check auth status from backend
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({
        authUser: res.data.response,
        userData: res.data.response?.userData,
        isLoggedIn: !!res.data.authUser,
      });
      get().connectSocket();
    } catch (error) {
      console.log("Error in authCheck: ", error);
      set({ authUser: null, userData: null, isLoggedIn: false });
    } finally {
      set({ isLoading: false, isCheckingAuth: false });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isUpdatingProfileImage: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile update successfully");
    } catch (error: any) {
      console.log("Error updating profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfileImage: false });
    }
  },

  signup: async (data: SignupFormData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      console.log(res.data);
      set({
        authUser: res.data,
        userData: res.data.userData,
        isLoggedIn: true,
      });
      toast.success("Account Create Successfully!");
      get().connectSocket();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data: LoginFormData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      console.log(res.data);
      set({
        authUser: res.data,
        userData: res.data.userData,
        isLoggedIn: true,
      });
      toast.success("Logged In Successfully!");
      get().connectSocket();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  // ✅ Logout clears auth state
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({
        authUser: null,
        userData: null,
        isLoggedIn: false,
        isLoading: false,
      });
      toast.success("Logged Out Successfully!");
      get().disconnectSocket();
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log("Logout Error: ", error);
    }
  },

  // authStore.ts
  updateHasAds: async () => {
    try {
      const res = await axiosInstance.put("/auth/has-ads", {
        userId: get().authUser?._id,
      });

      // Update the store with the latest userData from backend
      set((state) => ({
        userData: {
          ...state.userData,
          ...res.data.userData,
        },
      }));

      toast.success("Ads disabled successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to disable ads");
    }
  },

  fetchMyMatches: async () => {
    set({ isLoadingMatches: true });
    try {
      const res = await axiosInstance.get("/getMatchHistoryForMe");
      set({ myMatches: res.data });
      console.log(res.data);
    } catch (err: any) {
      console.error("Failed to fetch matches", err);
      toast.error(err.response?.data?.message || "Failed to fetch matches");
      set({ myMatches: [] });
    } finally {
      set({ isLoadingMatches: false });
    }
  },

  fetchMyHistory: async () => {
    set({ isLoadingHistory: true });
    try {
      const res = await axiosInstance.get("/getPlayerHistoryForMe");
      set({ myHistory: res.data });
      console.log(res.data);
    } catch (err: any) {
      console.error("Failed to fetch matches", err);
      toast.error(err.response?.data?.message || "Failed to fetch matches");
      set({ myHistory: [] });
    } finally {
      set({ isLoadingHistory: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
    });

    socket.connect();

    set({ socket });

    //listen for online user event

    socket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket?.disconnect();
    }
  },
}));
