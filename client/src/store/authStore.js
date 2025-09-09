import { create } from "zustand";
import axios from "axios";
import { persist } from "zustand/middleware";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL_DEVELOPMENT;

// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL_PRODUCTION;

// const API_BASE_URL = "http://localhost:5000/api/auth";
// const API_BASE_URL = "https://resumebuilderserver.onrender.com/api/auth";


const useAuthStore = create(
  persist((set) => ({
    user: null,
    isAuthenticated: false,
    loading: false,

    fetchUser: async () => {
      set({ loading: true });
      try {
        const response = await axios.get(`${API_BASE_URL}/me`, {
          withCredentials: true,
        });

        set((state) => ({
          user: response.data,
          isAuthenticated: state.isAuthenticated || !!response.data,
          loading: false,
        }));

        // 👇 Reset resume state after fetching new user
        import("../store/resumeStore").then(({ default: useResumeStore }) => {
          useResumeStore.getState().resetAll();
        });

      } catch (error) {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    },


    signup: async (userData) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/signup`,
          userData,
          { withCredentials: true }
        );
        set({ user: response.data.user, isAuthenticated: true });
      } catch (error) {
        console.error("Signup failed:", error.response?.data?.message);
        throw error; // Ensure error is caught in the component
      }
    },

    login: async (credentials) => {
      set({ loading: true });
      try {
        await axios.post(`${API_BASE_URL}/login`, credentials, {
          withCredentials: true,
        });

        // ✅ Clear old resume state
        const resumeStore = await import("../store/resumeStore");
        resumeStore.default.getState().resetAll();

        // ✅ Fetch fresh user
        await useAuthStore.getState().fetchUser();

        // ✅ Fetch new user's resumes
        resumeStore.default.getState().fetchALLResume();

      } catch (error) {
        console.error("Login failed:", error.response?.data?.message);
      } finally {
        set({ loading: false });
      }
    },



    logout: async () => {
      try {
        await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });

        // ✅ Clear resume data
        const resumeStore = await import("../store/resumeStore");
        resumeStore.default.getState().resetAll();

        set({ user: null, isAuthenticated: false });

      } catch (error) {
        console.error("Logout failed:", error.response?.data?.message);
      }
    }


  }),
    { name: "auth-storage" } // 🔹 Added persist storage name
  )
);

export default useAuthStore;
