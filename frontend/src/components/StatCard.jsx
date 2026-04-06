import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const colorMap = {
    primary: 'text-violet-400 border-violet-500/20 bg-violet-500/10',
    success: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    destructive: 'text-rose-400 border-rose-500/20 bg-rose-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass p-6 rounded-2xl ${colorMap[color]} flex flex-col gap-2`}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium opacity-70 uppercase tracking-wider">{title}</span>
        {Icon && <Icon className="w-5 h-5 opacity-70" />}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
