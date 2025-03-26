import React from 'react';

const ActionButton = ({ icon, label, onClick, primary = false }) => {
  const handleClick = (e) => {
    // Always prevent default to avoid page refresh
    e.preventDefault();
    
    // Call the provided onClick handler with the event
    if (onClick) onClick(e);
  };

  return (
    <button
      type="button" // Explicitly set type to button to prevent form submission
      className={`w-full flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
        primary 
          ? 'bg-accent-color text-black hover:bg-[#F0AD4E]' 
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
      onClick={handleClick}
    >
      {icon}
      {label}
    </button>
  );
};

export default ActionButton;
