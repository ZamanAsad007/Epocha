// src/hooks/usePlaces.js
import { useMemo, useEffect } from "react";
import useMapStore from "../store/mapStore.js";
import { api } from "../utils/api.js";

const normalizeCategory = (raw) => {
  const c = String(raw ?? "").trim().toLowerCase();
  if (!c) return "culture";

  const known = ["war", "culture", "music", "religion", "ruins", "architecture"];
  if (known.includes(c)) return c;

  if (/(war|wars|conflict|battle|military)/.test(c)) return "war";
  if (c.includes("ruin")) return "ruins";
  if (c.includes("relig")) return "religion";
  if (c.includes("music")) return "music";
  if (c.includes("arch")) return "architecture";
  if (c.includes("cult")) return "culture";

  return "culture";
};

const normalizePlace = (p) => ({
  ...p,
  category: normalizeCategory(p?.category),
  era: String(p?.era ?? "modern").trim().toLowerCase(),
  year: p?.year === null || p?.year === undefined ? null : Number(p.year),
  lat: Number(p?.lat),
  lng: Number(p?.lng),
});

// Returns places filtered by active category filters + year slider.
// NOTE: We do NOT cap marker count here; the cap is applied after viewport filtering
// so Europe/Asia/etc. don't get "crowded out" by whatever 300 records happen to come first.
export function usePlaces() {
  const { activeFilters, sliderYear, places, setPlaces, setIsUpdating } = useMapStore();

  useEffect(() => {
    let cancelled = false;

    const fetchPlaces = async () => {
      setIsUpdating(true);
      try {
        const response = await api.get("/api/places");
        if (!cancelled) {
          setPlaces((response.data || []).map(normalizePlace));
        }
      } catch (error) {
        console.error("Error fetching places:", error);
      } finally {
        if (!cancelled) setIsUpdating(false);
      }
    };

    fetchPlaces();
    return () => {
      cancelled = true;
    };
  }, [setPlaces, setIsUpdating]);

  const filtered = useMemo(() => {
    if (!places || places.length === 0) return [];

    return places.filter((p) => {
      const inCategory = activeFilters.includes(p.category);
      const inYear = p.year == null || p.year <= sliderYear;
      return inCategory && inYear;
    });
  }, [places, activeFilters, sliderYear]);

  return filtered;
}
