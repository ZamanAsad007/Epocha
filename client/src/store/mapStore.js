// src/store/mapStore.js
import create from "zustand";
import { devtools } from "zustand/middleware";

// Initial state as per Phase 1
const useMapStore = create(
  devtools((set) => ({
    selectedPlace: null,
    activeFilters: ["war", "culture", "music", "religion", "ruins", "architecture"],
    sliderYear: 1945,
    isGuest: true,
    places: [],
    user: null,
    bordersVisible: false,
    isUpdating: false,
    // Actions
    setSelectedPlace: (place) => set({ selectedPlace: place }),
    setIsUpdating: (val) => set({ isUpdating: val }),
    setBordersVisible: (val) => set((state) => ({
      bordersVisible: state.isGuest ? false : val
    })),
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
    setPlaces: (places) => set({ places }),
    setUser: (user) => set({ user, isGuest: !user }),
  }))
);

export default useMapStore;
