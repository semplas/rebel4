import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, change, icon }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-md shadow-amazon p-6 hover:shadow-amazon-hover transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-xs text-gray-500 mt-1">{change}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-full">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;