import React from 'react';
import { motion } from 'framer-motion';

export default function ColorBlockPlaceholder({ 
  width = '100%', 
  height = '200px',
  colors = ['#4a7c6b', '#b5956a', '#b08880', '#5a6f89'],
  animate = true 
}) {
  return (
    <div 
      className="relative overflow-hidden rounded-lg"
      style={{ width, height }}
    >
      <div className="grid grid-cols-2 h-full">
        {colors.map((color, i) => (
          <motion.div
            key={i}
            className="w-full h-full"
            style={{ backgroundColor: color }}
            initial={animate ? { opacity: 0, scale: 0.8 } : {}}
            animate={animate ? { opacity: 1, scale: 1 } : {}}
            transition={{ 
              delay: i * 0.1,
              duration: 0.4,
              ease: 'easeOut'
            }}
          />
        ))}
      </div>
      {animate && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear'
          }}
        />
      )}
    </div>
  );
}