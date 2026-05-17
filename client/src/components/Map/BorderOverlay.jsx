// src/components/Map/BorderOverlay.jsx
import React, { useState, useEffect } from 'react';
import { GeoJSON } from 'react-leaflet';
import useMapStore from '../../store/mapStore';
import { loadBorders, getNearestSnapshot } from '../../utils/borderManager';

const BorderOverlay = ({ year, visible }) => {
  const { isGuest } = useMapStore();
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');

  const effectiveYear = isGuest ? Math.min(year, 1945) : year;

  useEffect(() => {
    if (!visible) {
      setGeoData(null);
      return;
    }

    setLoading(true);
    loadBorders(effectiveYear)
      .then(data => {
        setGeoData(data);
        setSnapshotLabel(getNearestSnapshot(effectiveYear).label);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed loading borders overlay:", err);
        setLoading(false);
      });
  }, [effectiveYear, visible]);

  if (!visible || !geoData) return null;

  return (
    <>
      <GeoJSON
        key={`${snapshotLabel}_${effectiveYear}`} // key triggers re-render on snapshot change
        data={geoData}
        style={() => ({
          color: '#C9A84C', // Gold border color
          weight: 1.5,
          opacity: 0.6,
          fillColor: '#C9A84C',
          fillOpacity: 0.04, // Very subtle fill
          dashArray: null
        })}
        onEachFeature={(feature, layer) => {
          // Show territory name on hover if it exists
          const name = feature.properties?.NAME || feature.properties?.name;
          if (name) {
            layer.bindTooltip(name, {
              permanent: false,
              className: 'border-tooltip',
              direction: 'center',
              sticky: true // Tooltip follows the mouse cursor
            });
          }

          // Dynamic hover styling
          layer.on({
            mouseover: (e) => {
              const l = e.target;
              l.setStyle({
                fillOpacity: 0.12,
                weight: 2,
                color: '#E2C06A' // Lighter hover gold
              });
            },
            mouseout: (e) => {
              const l = e.target;
              l.setStyle({
                fillOpacity: 0.04,
                weight: 1.5,
                color: '#C9A84C'
              });
            }
          });
        }}
      />

      {/* Snapshot year indicator at the bottom left of the map */}
      <div className="absolute bottom-28 left-4 z-[1000]
                      bg-[#141414]/90 backdrop-blur-md border border-[#C9A84C]/50
                      rounded px-3.5 py-2 text-[#C9A84C]
                      font-mono text-[10px] tracking-widest uppercase font-bold shadow-2xl flex items-center gap-2">
        <span>🗺️ Borders: {snapshotLabel}</span>
        {loading && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#E2C06A] animate-ping" />
        )}
      </div>
    </>
  );
};

export default BorderOverlay;
