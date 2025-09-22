import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

interface User {
  _id: string;
  email: string;
  username: string;
  profilePic: string;
}

interface UserData {
  rank: string;
  mmr: number;
  level: number;
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

interface AuthState {
  authUser: User | null;
  userData: UserData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  checkAuth: () => Promise<void>;
  signup: (data: SignupFormData) => void;
  login: (data: LoginFormData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  userData: null,
  isLoggedIn: false,
  isLoading: false,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,

  // ✅ Check auth status from backend
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({
        authUser: res.data.response,
        userData: res.data.response.userData,
        isLoggedIn: !!res.data.authUser,
      });
    } catch (error) {
      console.log("Error in authCheck: ", error);
      set({ authUser: null, userData: null, isLoggedIn: false });
    } finally {
      set({ isLoading: false, isCheckingAuth: false });
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
    } catch (error:any) {
      toast.error(error.response.data.message);
      console.log("Logout Error: ", error);
    }
  },
}));
