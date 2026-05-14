// src/App.jsx
import React, { useEffect } from 'react';
import axios from 'axios';
import useMapStore from './store/mapStore';
import Navbar from "./components/UI/Navbar";
import MapView from "./components/Map/MapView";
import FilterBar from "./components/Filters/FilterBar";
import TimeSlider from "./components/Map/TimeSlider";
import Sidebar from "./components/Sidebar/Sidebar";
import DailyBanner from './components/UI/DailyBanner';

function App() {
  const { setPlaces, sliderYear } = useMapStore();

  useEffect(() => {
    const fetchInitialPlaces = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/places?year=${sliderYear}`);
        setPlaces(response.data);
      } catch (error) {
        console.error('Error loading initial archive data:', error);
      }
    };
    fetchInitialPlaces();
  }, [setPlaces]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-text-primary font-sans">
      <Navbar />
      <DailyBanner />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Map always takes full background */}
        <MapView />

        {/* Overlays */}
        <div className="absolute inset-x-0 top-0 z-[2500]">
          <FilterBar />
        </div>
        
        <TimeSlider />
        <Sidebar />
      </main>
    </div>
  );
}

export default App;
