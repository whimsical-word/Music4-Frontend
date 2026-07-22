import { create } from "zustand";

export const useErrorStore = create((set) => ({
  errorStatus: null,

  setErrorStatus: (status) => {
    set({ errorStatus: status });
  },

  clearError: () => {
    set({ errorStatus: null });
  },
}));
