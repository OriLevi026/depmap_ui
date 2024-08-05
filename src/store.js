// src/store.js
import create from 'zustand';

const useStore = create((set) => ({
  viewerMode: null,
  viewerContent: null,
  loading: false,
  error: null,

  setViewerMode: (mode) => set({ viewerMode: mode }),
  setViewerContent: (content) => set({ viewerContent: content }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default useStore;
