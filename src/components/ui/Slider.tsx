'use client';

import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: number[];
  onChange: (value: number[]) => void;
}

export const Slider: React.FC<SliderProps> = ({ min, max, value, onChange }) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value);
    onChange([newMin, value[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value);
    onChange([value[0], newMax]);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span>${value[0]}</span>
        <span>${value[1]}</span>
      </div>
      <div className="relative h-1 bg-gray-200 rounded-full">
        <div
          className="absolute h-1 bg-[var(--primary-color)]"
          style={{
            left: `${((value[0] - min) / (max - min)) * 100}%`,
            right: `${100 - ((value[1] - min) / (max - min)) * 100}%`
          }}
        />
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={handleMinChange}
          className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none"
          style={{ zIndex: 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={handleMaxChange}
          className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
};