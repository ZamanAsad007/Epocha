import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/UI/Navbar";
import MapView from "./components/Map/MapView";
import FilterBar from "./components/Filters/FilterBar";
import TimeSlider from "./components/Map/TimeSlider";
import Sidebar from "./components/Sidebar/Sidebar";
import AuthPage from './pages/AuthPage';

function App() {

  return (
    <Router>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-text-primary font-sans">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={
            <>
              <Navbar />
              <main className="flex-1 relative overflow-hidden">
                <MapView />
                <div className="absolute inset-x-0 top-0 z-[2500]">
                  <FilterBar />
                </div>
                <TimeSlider />
                <Sidebar />
              </main>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
