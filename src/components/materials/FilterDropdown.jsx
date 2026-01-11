import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function FilterDropdown({ isOpen, options, selectedValue, onSelect, title }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 40,
            mass: 0.8
          }}
          className="overflow-hidden"
        >
          <motion.div 
            className="backdrop-blur-md rounded-lg mt-2 p-4 shadow-2xl"
            style={{ 
              backgroundColor: 'var(--tone-light-10, rgba(255,255,255,0.1))',
              borderColor: 'var(--tone-border, rgba(255,255,255,0.2))',
              border: '1px solid',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2)'
            }}
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            exit={{ y: -20 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => onSelect(option)}
                  className={cn(
                    "px-4 py-2.5 rounded-md text-sm font-light tracking-wide transition-all",
                    "hover:scale-105"
                  )}
                  style={{
                    backgroundColor: selectedValue === option 
                      ? 'var(--tone-light-20, rgba(255,255,255,0.2))' 
                      : 'var(--tone-light-10, rgba(255,255,255,0.05))',
                    color: selectedValue === option 
                      ? 'var(--tone-text, rgba(255,255,255,1))' 
                      : 'var(--tone-text-secondary, rgba(255,255,255,0.7))',
                    border: selectedValue === option 
                      ? '1px solid var(--tone-border, rgba(255,255,255,0.3))' 
                      : '1px solid transparent'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}