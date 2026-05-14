// src/hooks/usePlaces.js
import { useMemo } from "react";
import useMapStore from "../store/mapStore.js";
import { places } from "../data/places.js";

// Returns places filtered by active category filters and (optionally) year slider
export function usePlaces() {
  const { activeFilters, sliderYear } = useMapStore();
  const filtered = useMemo(() => {
    return places.filter((p) => {
      const inCategory = activeFilters.includes(p.category);
      const inYear = Math.abs(p.year) <= Math.abs(sliderYear); // simple range check
      return inCategory && inYear;
    });
  }, [activeFilters, sliderYear]);
  return filtered;
}
