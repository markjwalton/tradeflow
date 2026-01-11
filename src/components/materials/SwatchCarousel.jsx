import React from "react";
import { Carousel } from "motion-plus/react";
import { motion } from "framer-motion";

export default function SwatchCarousel({ swatches, onSwatchClick }) {
  return (
    <div className="w-full">
      <Carousel
        className="relative"
        items={swatches.map((swatch) => (
          <motion.div
            key={swatch.id}
            className="cursor-pointer"
            onClick={() => onSwatchClick(swatch)}
            whileHover={{ scale: 1.05 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25 
            }}
          >
            <div className="relative rounded-lg overflow-hidden backdrop-blur-sm transition-all w-48"
              style={{ 
                backgroundColor: 'var(--tone-light-10, rgba(255,255,255,0.05))',
                borderColor: 'var(--tone-light-20, rgba(255,255,255,0.1))',
                border: '1px solid'
              }}
            >
              <div className="aspect-square relative">
                <img 
                  draggable={false}
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
        overflow
        gap={20}
        snap="center"
      />
    </div>
  );
}