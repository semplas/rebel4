'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Bubble interface for type safety
interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

export default function BrandLoader() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Generate random bubbles on component mount
  useEffect(() => {
    const colors = [
      'rgba(255, 153, 0, 0.3)',  // accent-color with opacity
      'rgba(20, 110, 180, 0.3)', // accent-secondary with opacity
      'rgba(255, 255, 255, 0.2)', // white with opacity
      'rgba(19, 25, 33, 0.1)'    // primary-color with opacity
    ];
    
    const newBubbles: Bubble[] = [];
    // Reduce from 15 to 5 bubbles
    for (let i = 0; i < 5; i++) {
      newBubbles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 40 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 8 + 4
      });
    }
    setBubbles(newBubbles);
  }, []);

  // Add a maximum timeout for loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000); // 5 seconds max loading time
    
    return () => clearTimeout(timeout);
  }, [loading]);

  // Letter animation for text reveal
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  const awakndText = "Awaknd";
  const rebelText = "Rebel";

  return (
    <div className="flex flex-col justify-center items-center h-64 w-full relative overflow-hidden">
      {/* Animated background bubbles */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: bubble.size,
            height: bubble.size,
            backgroundColor: bubble.color,
          }}
          animate={{
            y: [0, -100],
            x: [0, Math.random() * 40 - 20],
            opacity: [0.7, 0]
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-8 relative z-10"
      >
        <div className="flex items-baseline">
          {/* Awaknd text with letter animation */}
          <div className="overflow-hidden">
            {awakndText.split('').map((char, index) => (
              <motion.span
                key={`awaknd-${index}`}
                custom={index}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl md:text-5xl font-bold tracking-tight text-primary-color inline-block"
                style={{
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>
          
          {/* Rebel text with letter animation */}
          <div className="overflow-hidden ml-3">
            {rebelText.split('').map((char, index) => (
              <motion.span
                key={`rebel-${index}`}
                custom={index + awakndText.length}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl md:text-5xl font-bold tracking-tight text-accent-color inline-block"
                style={{
                  textShadow: '0 2px 10px rgba(255,153,0,0.3)'
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Premium loading bar with gradient */}
      <div className="relative w-48 h-2 bg-gray-200/30 rounded-full overflow-hidden z-10">
        <motion.div 
          className="absolute top-0 left-0 h-full"
          style={{
            background: 'linear-gradient(to right, #ff9900, #146eb4)'
          }}
          initial={{ width: "0%" }}
          animate={{ 
            width: ["0%", "100%"],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
      </div>
      
      {/* Tagline with fade in */}
      <motion.div 
        className="mt-6 flex space-x-2 z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8,
          delay: 1
        }}
      >
        <span className="text-sm uppercase tracking-widest text-gray-600 font-medium px-3 py-1 rounded-full bg-white/30">
          Premium Footwear
        </span>
      </motion.div>
    </div>
  );
}
