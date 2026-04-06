import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Dot,
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-4 rounded-xl border-white/20 shadow-2xl">
        <p className="text-xs text-white/50 mb-2">{new Date(label).toLocaleTimeString()}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-sm font-medium">
              {entry.name}: <span className="text-white/90">{entry.value.toFixed(2)}</span>
            </p>
          </div>
        ))}
        {payload[0].payload.anomaly === 1 && (
          <div className="mt-2 text-xs font-bold text-rose-400 uppercase tracking-tighter animate-pulse text-center bg-rose-500/10 py-1 rounded">
            ⚠️ Anomaly Detected
          </div>
        )}
      </div>
    );
  }
  return null;
};

const SensorChart = ({ data }) => {
  const formatTime = (timeStr) => {
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass p-6 rounded-3xl h-[450px] w-full"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Sensor telemetry</h3>
          <p className="text-sm text-white/50">Real-time monitoring and anomaly detection</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="#ffffff40"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="temperature"
            stroke="#8b5cf6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorTemp)"
            name="Temperature"
            dot={(props) => {
              if (props.payload.anomaly === 1) {
                return (
                  <Dot
                    {...props}
                    r={6}
                    fill="#f43f5e"
                    stroke="#ffffffa0"
                    strokeWidth={2}
                    className="animate-pulse"
                  />
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="vibration"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorVib)"
            name="Vibration"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default SensorChart;
