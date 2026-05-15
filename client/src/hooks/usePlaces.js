// src/hooks/usePlaces.js
import { useMemo, useEffect } from "react";
import axios from "axios";
import useMapStore from "../store/mapStore.js";

// Returns places filtered by active category filters and (optionally) year slider
export function usePlaces() {
  const { activeFilters, sliderYear, places, setPlaces } = useMapStore();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/places");
        setPlaces(response.data);
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };
    fetchPlaces();
  }, [setPlaces]);

  const filtered = useMemo(() => {
    if (!places) return [];
    return places.filter((p) => {
      const inCategory = activeFilters.includes(p.category);
      const year = p.year || 0;
      const inYear = year <= sliderYear;
      return inCategory && inYear;
    });
  }, [places, activeFilters, sliderYear]);

  return filtered;
}
