'use client';

import { motion, AnimatePresence } from 'framer-motion';
import BrandLoader from './BrandLoader';

interface LoadingOverlayProps {
  isLoading: boolean;
}

export default function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="text-center">
            <BrandLoader />
            <p className="mt-4 text-gray-600 font-medium">Loading...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}