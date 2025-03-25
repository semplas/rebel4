'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingButtonProps {
  isLoading: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function LoadingButton({
  isLoading,
  onClick,
  className = '',
  children,
  type = 'button',
  disabled = false
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`relative ${className}`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-md">
          <motion.div
            className="w-5 h-5 border-2 border-t-transparent border-accent-color rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
}