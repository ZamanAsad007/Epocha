import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../UI/LoadingSpinner';
import { api } from '../../utils/api.js';

const StatsPanel = ({ selectedPlace }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <p className="text-war">Failed to load archive data.</p>;

  if (selectedPlace) {
    const categoryCount = stats.byCategory[selectedPlace.category] || 0;
    const eraCount = stats.byEra[selectedPlace.era] || 0;

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="text-center pb-4 border-b border-border">
          <h3 className="text-xs font-bold text-primary uppercase tracking-[0.3em]">Site Analytics</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <StatCard 
            label={`Places in ${selectedPlace.category}`} 
            value={categoryCount} 
            total={stats.total}
            color={`text-${selectedPlace.category}`}
          />
          <StatCard 
            label={`Places in ${selectedPlace.era} era`} 
            value={eraCount} 
            total={stats.total}
            color="text-primary"
          />
          <div className="p-5 bg-background-card border border-border rounded text-center">
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Archival Bookmarks</p>
            <p className="text-2xl font-mono text-primary">0</p>
            <p className="text-[9px] text-text-muted italic mt-1">(Global data syncing in Phase 3)</p>
          </div>
        </div>
      </div>
    );
  }

  // Global Stats
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="text-center">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.4em] mb-2">Total Archival Records</p>
        <h2 className="text-5xl font-mono font-bold text-primary tracking-tighter">
          {stats.total.toLocaleString()}
        </h2>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest border-b border-border pb-2">Records by Category</h3>
        <div className="space-y-4">
          {Object.entries(stats.byCategory).map(([cat, count]) => (
            <div key={cat} className="space-y-1">
              <div className="flex justify-between text-[10px] uppercase tracking-widest">
                <span className="text-text-secondary">{cat}</span>
                <span className="font-mono text-primary">{count}</span>
              </div>
              <div className="w-full h-1 bg-background-card rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-${cat} transition-all duration-1000`} 
                  style={{ width: `${(count / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest border-b border-border pb-2">Records by Era</h3>
        <div className="space-y-4">
          {Object.entries(stats.byEra).map(([era, count]) => (
            <div key={era} className="space-y-1">
              <div className="flex justify-between text-[10px] uppercase tracking-widest">
                <span className="text-text-secondary">{era}</span>
                <span className="font-mono text-primary">{count}</span>
              </div>
              <div className="w-full h-1 bg-background-card rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${(count / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, total, color }) => (
  <div className="p-5 bg-background-card border border-border rounded flex flex-col items-center text-center">
    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-4xl font-mono font-bold ${color}`}>{value}</p>
    <div className="w-full h-1 bg-background-panel rounded-full mt-3 overflow-hidden">
      <div className={`h-full ${color.replace('text-', 'bg-')} opacity-40`} style={{ width: `${(value / total) * 100}%` }}></div>
    </div>
  </div>
);

export default StatsPanel;
