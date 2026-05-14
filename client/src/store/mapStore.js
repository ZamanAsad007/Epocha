// src/store/mapStore.js
import create from "zustand";
import { devtools } from "zustand/middleware";

// Initial state as per Phase 1
const useMapStore = create(
  devtools((set) => ({
    selectedPlace: null,
    activeFilters: ["war", "culture", "music", "religion", "ruins"],
    sliderYear: 1945,
    isGuest: true,
    // Actions
    setSelectedPlace: (place) => set({ selectedPlace: place }),
    toggleFilter: (category) =>
      set((state) => {
        const exists = state.activeFilters.includes(category);
        const newFilters = exists
          ? state.activeFilters.filter((c) => c !== category)
          : [...state.activeFilters, category];
        return { activeFilters: newFilters };
      }),
    setSliderYear: (year) => set({ sliderYear: year }),
    clearSelectedPlace: () => set({ selectedPlace: null }),
  }))
);

export default useMapStore;
