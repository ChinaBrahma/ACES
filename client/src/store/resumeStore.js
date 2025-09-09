import { create } from "zustand";
import axios from "axios";
import { persist } from "zustand/middleware";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL_DEVELOPMENT;
// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL_PRODUCTION;

const useResumeStore = create(
  persist(
    (set, get) => ({
      step: 1,
      personalInfo: { name: "", email: "", phone: "", linkedin: "", github: "" },
      skills: [],
      experience: [],
      projects: [],
      education: [],
      achievements: [],
      extracurricular: [],
      resumes: [],
      currentResumeId: null,
      loading: false,

      // In resumeStore.js

      resetAll: () =>
        set({
          step: 1,
          personalInfo: { name: "", email: "", phone: "", linkedin: "", github: "" },
          skills: [],
          experience: [],
          projects: [],
          education: [],
          achievements: [],
          extracurricular: [],
          resumes: [],
          currentResumeId: null,
          loading: false,
        }),





      // Setters
      setPersonalInfo: (data) => set({ personalInfo: data }),
      setSkills: (data) => set({ skills: data }),
      setExperience: (data) => set({ experience: data }),
      setProjects: (data) => set({ projects: data }),
      setEducation: (data) => set({ education: data }),
      setAchievements: (data) => set({ achievements: data }),
      setExtracurricular: (data) => set({ extracurricular: data }),

      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: state.step - 1 })),
      setStep: (step) => set({ step }),

      loadResume: (resume) => {
        set({
          personalInfo: resume.personalInfo,
          skills: resume.skills,
          experience: resume.experience,
          projects: resume.projects,
          education: resume.education,
          achievements: resume.achievements || [],
          extracurricular: resume.extracurricular || [],
          currentResumeId: resume._id,
        });
      },

      resetForm: () =>
        set({
          step: 1,
          personalInfo: { name: "", email: "", phone: "", linkedin: "", github: "" },
          skills: [],
          experience: [],
          projects: [],
          education: [],
          achievements: [],
          extracurricular: [],
          currentResumeId: null,
        }),

      // ─────── API CALLS ───────

      saveResume: async () => {
        set({ loading: true });
        try {
          const { personalInfo, skills, experience, projects, education, achievements, extracurricular } = get();
          const resumeData = { personalInfo, skills, experience, projects, education, achievements, extracurricular };
          const response = await axios.post(`${API_BASE_URL}/resume/save`, resumeData, {
            withCredentials: true,
          });
          set({
            currentResumeId: response.data.resumeId || response.data._id,  // <-- updated
            loading: false,
          });
          get().fetchALLResume();
          return response.data;
        } catch (error) {
          console.error("🚨 Save Resume Error:", error.response?.data?.message || error.message);
          set({ loading: false });
          throw error;
        }
      },

      fetchResume: async (resumeId) => {
        if (!resumeId) return;
        set({ loading: true });
        try {
          const response = await axios.get(`${API_BASE_URL}/resume/get/${resumeId}`, {
            withCredentials: true,
          });
          const {
            personalInfo, skills, experience, projects, education, achievements, extracurricular, _id
          } = response.data;

          set({
            personalInfo,
            skills,
            experience,
            projects,
            education,
            achievements: achievements || [],
            extracurricular: extracurricular || [],
            currentResumeId: _id,
            loading: false,
          });
        } catch (error) {
          console.error("🚨 Fetch Resume Error:", error.response?.data?.message || error.message);
          set({ loading: false });
          throw error;
        }
      },

      fetchALLResume: async () => {
        set({ loading: true });
        try {
          const response = await axios.get(`${API_BASE_URL}/resume/getAll`, {
            withCredentials: true,
          });
          set({ resumes: response.data.resumes, loading: false });
        } catch (error) {
          console.error("🚨 Fetch All Resumes Error:", error.response?.data?.message || error.message);
          set({ loading: false });
          throw error;
        }
      },

      updateResume: async (resumeId) => {
        if (!resumeId) return;
        set({ loading: true });
        try {
          const {
            personalInfo, skills, experience, projects, education, achievements, extracurricular,
          } = get();

          const updatedData = {
            personalInfo, skills, experience, projects, education, achievements, extracurricular,
          };

          const response = await axios.patch(`${API_BASE_URL}/resume/update/${resumeId}`, updatedData, {
            withCredentials: true,
          });

          const updated = response.data.resume || {};
          set({
            personalInfo: updated.personalInfo || personalInfo,
            skills: updated.skills || skills,
            experience: updated.experience || experience,
            projects: updated.projects || projects,
            education: updated.education || education,
            achievements: updated.achievements || achievements,
            extracurricular: updated.extracurricular || extracurricular,
            loading: false,
          });

          get().fetchALLResume();
          return response.data;
        } catch (error) {
          console.error("🚨 Update Resume Error:", error.response?.data?.message || error.message);
          set({ loading: false });
          throw error;
        }
      },

      deleteResume: async (resumeId) => {
        set({ loading: true });
        try {
          await axios.delete(`${API_BASE_URL}/resume/delete/${resumeId}`, {
            withCredentials: true,
          });
          set((state) => ({
            resumes: state.resumes.filter((resume) => resume._id !== resumeId),
            currentResumeId: state.currentResumeId === resumeId ? null : state.currentResumeId,
            loading: false,
          }));
          get().fetchALLResume();
        } catch (error) {
          console.error("🚨 Delete Resume Error:", error.response?.data?.message || error.message);
          set({ loading: false });
          throw error;
        }
      },

      downloadResume: async (resumeId) => {
        if (!resumeId) return;
        set({ loading: true });
        try {
          const response = await axios.get(`${API_BASE_URL}/resume/download/${resumeId}`, {
            withCredentials: true,
            responseType: "blob",
          });
          const blob = new Blob([response.data], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `Resume-${resumeId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          set({ loading: false });
        } catch (error) {
          console.error("🚨 Download Resume Error:", error.response?.data?.message || error.message);
          set({ loading: false });
          throw error;
        }
      },
    }),
    { name: "resume-storage" }
  )


);

export default useResumeStore;
