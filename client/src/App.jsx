// src/App.jsx
import React from "react";
import Navbar from "./components/UI/Navbar";
import MapView from "./components/Map/MapView";
import FilterBar from "./components/Filters/FilterBar";
import TimeSlider from "./components/Map/TimeSlider";
import Sidebar from "./components/Sidebar/Sidebar";

function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-900 text-white font-sans">
      <Navbar />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Map always takes full background */}
        <MapView />

        {/* Overlays */}
        <FilterBar />
        <TimeSlider />
        <Sidebar />
      </main>
    </div>
  );
}

export default App;
