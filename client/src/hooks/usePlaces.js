// src/hooks/usePlaces.js
import { useMemo, useEffect } from "react";
import axios from "axios";
import useMapStore from "../store/mapStore.js";

const MAX_MARKERS = 300;

// Returns places filtered by active category filters and (optionally) year slider
export function usePlaces() {
  const { activeFilters, sliderYear, places, setPlaces, setIsUpdating } = useMapStore();

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
    if (!places || places.length === 0) return [];
    
    setIsUpdating(true);
    
    const result = places
      .filter((p) => {
        const inCategory = activeFilters.includes(p.category);
        const year = p.year || 0;
        const inYear = year <= sliderYear;
        return inCategory && inYear;
      })
      .sort((a, b) => {
        // prioritize places with images and descriptions
        const scoreA = (a.imageUrl ? 1 : 0) + (a.description ? 1 : 0);
        const scoreB = (b.imageUrl ? 1 : 0) + (b.description ? 1 : 0);
        return scoreB - scoreA;
      })
      .slice(0, MAX_MARKERS);

    // Subtle delay to show updating state if needed, or just set it back
    setTimeout(() => setIsUpdating(false), 300);
    
    return result;
  }, [places, activeFilters, sliderYear, setIsUpdating]);

  return filtered;
}
