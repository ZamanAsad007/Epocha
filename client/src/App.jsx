// src/App.jsx
import React from "react";
import Navbar from "./components/UI/Navbar";
import MapView from "./components/Map/MapView";
import FilterBar from "./components/Filters/FilterBar";
import TimeSlider from "./components/Map/TimeSlider";
import Sidebar from "./components/Sidebar/Sidebar";

function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-text-primary font-sans">
      <Navbar />
      
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
