import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ColorBlockPlaceholder from './ColorBlockPlaceholder';

export default function ScrollRevealImage({ 
  src, 
  alt = '',
  colors,
  parallaxStrength = 0.5,
  className = ''
}) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${parallaxStrength * 100}%`]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.95]);

  return (
    <div ref={ref} className={`relative h-screen overflow-hidden ${className}`}>
      <motion.div 
        className="absolute inset-0"
        style={{ y, opacity, scale }}
      >
        {!loaded && (
          <ColorBlockPlaceholder 
            width="100%" 
            height="100%" 
            colors={colors}
            animate={true}
          />
        )}
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
        />
      </motion.div>
    </div>
  );
}