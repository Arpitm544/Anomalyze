import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Thermometer, 
  Zap, 
  Wind, 
  ShieldCheck, 
  ShieldAlert,
  BarChart3,
  RefreshCcw,
  LayoutDashboard
} from 'lucide-react';
import StatCard from './components/StatCard';
import SensorChart from './components/SensorChart';
import AnomalyList from './components/AnomalyList';

const API_BASE_URL = 'https://anomalyze-1.onrender.com';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/data?limit=40`);
      setData(response.data.data);
      setModelLoaded(response.data.model_loaded);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Connection lost. Retrying...');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    let interval;
    if (isLive) {
      interval = setInterval(fetchData, 3000); // 3-second polling
    }
    return () => clearInterval(interval);
  }, [fetchData, isLive]);

  const anomalies = data.filter(d => d.anomaly === 1).slice(-10).reverse();
  const latest = data[data.length - 1] || {};
  const previous = data[data.length - 2] || {};

  const getTrend = (key) => {
    if (!latest[key] || !previous[key]) return 0;
    return (((latest[key] - previous[key]) / previous[key]) * 100).toFixed(1);
  };

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/30">
      {/* Header */}
      <nav className="border-b border-white/5 py-4 px-8 flex justify-between items-center sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Anomalyze</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">ML Guardian v1.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${modelLoaded ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
            {modelLoaded ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
            {modelLoaded ? 'Model Loaded' : 'Model Offline'}
          </div>
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isLive ? 'bg-violet-600 shadow-lg shadow-violet-600/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-white/30'}`} />
            {isLive ? 'LIVE STREAM' : 'STREAM PAUSED'}
          </button>
        </div>
      </nav>

      <main className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Avg Temperature" 
            value={`${latest.temperature?.toFixed(1) || '--'}°C`} 
            icon={Thermometer} 
            trend={getTrend('temperature')}
            color="primary"
          />
          <StatCard 
            title="Vibration" 
            value={`${latest.vibration?.toFixed(1) || '--'}hz`} 
            icon={Activity} 
            trend={getTrend('vibration')}
            color="success"
          />
          <StatCard 
            title="Pressure" 
            value={`${latest.pressure?.toFixed(1) || '--'}psi`} 
            icon={BarChart3} 
            trend={getTrend('pressure')}
            color="primary"
          />
          <StatCard 
            title="Alert Intensity" 
            value={anomalies.length > 5 ? 'High' : anomalies.length > 0 ? 'Medium' : 'Stable'} 
            icon={ShieldAlert} 
            color={anomalies.length > 0 ? 'destructive' : 'success'}
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <SensorChart data={data} />
            
            {/* Legend & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-3xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">System Health</h4>
                    <p className="text-xs text-white/50">Processing 120 samples/sec</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">99.8%</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase">Optimal</p>
                </div>
              </div>
              <div className="glass p-6 rounded-3xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Resource Usage</h4>
                    <p className="text-xs text-white/50">VRAM Allocation: 1.2GB</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-violet-400">Low</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase">Efficiency</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[600px] lg:h-auto">
            <AnomalyList anomalies={anomalies} />
          </div>
        </div>
      </main>

      {error && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-6 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 z-[60]"
        >
          <RefreshCcw className="w-3 h-3 animate-spin" />
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default App;