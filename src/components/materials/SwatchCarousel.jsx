import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";

export default function SwatchCarousel({ swatches, onSwatchClick }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const baseVelocity = -20; // Pixels per second
  const baseX = useMotionValue(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  // Calculate total width of all items
  const itemWidth = 200; // Width of each swatch card
  const gap = 16; // Gap between cards
  const totalWidth = swatches.length * (itemWidth + gap);

  useAnimationFrame((t, delta) => {
    let moveBy = (baseVelocity * delta) / 1000;
    baseX.set(baseX.get() + moveBy);

    // Reset when we've scrolled the full width
    if (baseX.get() <= -totalWidth) {
      baseX.set(0);
    }
  });

  // Duplicate swatches for seamless loop
  const duplicatedSwatches = [...swatches, ...swatches];

  return (
    <div ref={containerRef} className="overflow-hidden">
      <motion.div 
        className="flex gap-4"
        style={{ x: baseX }}
      >
        {duplicatedSwatches.map((swatch, index) => (
          <motion.div
            key={`${swatch.id}-${index}`}
            className="flex-shrink-0 cursor-pointer group"
            style={{ width: itemWidth }}
            onClick={() => onSwatchClick(swatch)}
            whileHover={{ scale: 1.05 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25 
            }}
          >
            <div className="relative rounded-lg overflow-hidden backdrop-blur-sm transition-all"
              style={{ 
                backgroundColor: 'var(--tone-light-10, rgba(255,255,255,0.05))',
                borderColor: 'var(--tone-light-20, rgba(255,255,255,0.1))',
                border: '1px solid'
              }}
            >
              <div className="aspect-square relative">
                <img 
                  src={swatch.image} 
                  alt={swatch.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 backdrop-blur-sm">
                <h3 className="text-sm font-light tracking-wide text-center transition-colors" 
                  style={{ color: 'var(--tone-text, rgba(255,255,255,0.9))' }}>
                  {swatch.name}
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}