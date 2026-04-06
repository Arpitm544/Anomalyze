import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, Thermometer, Activity } from 'lucide-react';

const AnomalyList = ({ anomalies }) => {
  return (
    <div className="glass rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="w-5 h-5 text-rose-400" />
        <h3 className="text-lg font-bold">Detected Anomalies</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2">
        <AnimatePresence initial={false}>
          {anomalies.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-12">
              <Activity className="w-12 h-12 mb-2" />
              <p className="text-sm">No anomalies detected in the current window</p>
            </div>
          ) : (
            anomalies.map((item, idx) => (
              <motion.div
                key={item.timestamp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Elevated Sensors</p>
                    <div className="flex items-center gap-2 opacity-50 text-[10px]">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded">
                    CRITICAL
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnomalyList;
