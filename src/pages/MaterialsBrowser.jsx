import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ColorToneSelector from "@/components/sturij/ColorToneSelector";
import SwatchCarousel from "@/components/materials/SwatchCarousel";
import CarouselLoop from "@/components/motion-plus/CarouselLoop";
import FilterDropdown from "@/components/materials/FilterDropdown";

// Real wood swatches data
const materials = [
  { id: 1, name: "FA115", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/74ac893c3_FA115.jpg", category: "Wood", color: "Neutral", texture: "Smooth", finish: "Matt", style: "Contemporary" },
  { id: 2, name: "FA117", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/e1b2a7ae1_FA117.jpg", category: "Wood", color: "Warm", texture: "Smooth", finish: "Matt", style: "Contemporary" },
  { id: 3, name: "H0045 ST15", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/867a7e882_H0045_ST15_H.jpg", category: "Wood", color: "Light", texture: "Textured", finish: "Matt", style: "Natural" },
  { id: 4, name: "H046 ST15", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/d51aed765_H046_ST15_H.jpg", category: "Wood", color: "Medium", texture: "Textured", finish: "Matt", style: "Natural" },
  { id: 5, name: "H047 ST15", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/34c86e2ad_H047_ST15_H.jpg", category: "Wood", color: "Medium", texture: "Textured", finish: "Matt", style: "Rustic" },
  { id: 6, name: "H178 ST15", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/d4afc9a53_H178_ST15_H.jpg", category: "Wood", color: "Dark", texture: "Textured", finish: "Matt", style: "Traditional" },
  { id: 7, name: "H207 ST9", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/1253ea357_H207_ST9_H.jpg", category: "Wood", color: "Light", texture: "Smooth", finish: "Satin", style: "Natural" },
  { id: 8, name: "H0296 ST22", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/c164a15cd_H0296_ST22_H.jpg", category: "Wood", color: "Light", texture: "Smooth", finish: "Satin", style: "Contemporary" },
  { id: 9, name: "H1137 ST24", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/ad9deadf0_H1137_ST24_h.jpg", category: "Wood", color: "Neutral", texture: "Smooth", finish: "Matt", style: "Contemporary" },
  { id: 10, name: "H1232 ST9", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/04e32a9ac_H1232_ST9_H.jpg", category: "Wood", color: "Dark", texture: "Textured", finish: "Matt", style: "Traditional" },
];

export default function MaterialsBrowser() {
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Wood");
  const [filters, setFilters] = useState({
    color: "All",
    texture: "All",
    finish: "All",
    style: "All"
  });
  const [activeFilterTab, setActiveFilterTab] = useState(null);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const filterOptions = {
    swatches: [],
    favourites: [],
    colour: ["All", "Light", "Medium", "Dark", "Neutral", "Warm"],
    texture: ["All", "Smooth", "Textured"],
    finishes: ["All", "Matt", "Satin", "Gloss"],
    style: ["All", "Contemporary", "Traditional", "Rustic", "Natural"]
  };

  const toggleFilterTab = (tab) => {
    setActiveFilterTab(activeFilterTab === tab ? null : tab);
  };

  const filteredMaterials = materials.filter(material => {
    const colorMatch = filters.color === "All" || material.color === filters.color;
    const textureMatch = filters.texture === "All" || material.texture === filters.texture;
    const finishMatch = filters.finish === "All" || material.finish === filters.finish;
    const styleMatch = filters.style === "All" || material.style === filters.style;
    return colorMatch && textureMatch && finishMatch && styleMatch;
  });

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--tone-base, #65617d)' }}>
      {/* Top Navigation */}
      <nav className="bg-transparent transition-colors" style={{ borderBottom: '1px solid var(--tone-light-20, rgba(255,255,255,0.1))' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left Nav - hidden on mobile, compact on tablet */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
              <button className="text-xs lg:text-sm font-light tracking-wide transition-colors" style={{ color: 'var(--tone-text-secondary, rgba(255,255,255,0.8))' }}>
                About
              </button>
              <button className="text-xs lg:text-sm font-light tracking-wide transition-colors" style={{ color: 'var(--tone-text-secondary, rgba(255,255,255,0.8))' }}>
                Design
              </button>
              <button className="text-xs lg:text-sm font-light tracking-wide transition-colors" style={{ color: 'var(--tone-text-secondary, rgba(255,255,255,0.8))' }}>
                Manufacture
              </button>
              <button className="text-xs lg:text-sm font-light tracking-wide transition-colors" style={{ color: 'var(--tone-text-secondary, rgba(255,255,255,0.8))' }}>
                Installation
              </button>
            </div>

            {/* Logo - centered on mobile */}
            <div className="flex items-center gap-2 mx-auto md:mx-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white/20" />
              </div>
              <span className="text-lg sm:text-xl font-light tracking-widest transition-colors" style={{ color: 'var(--tone-text, rgba(255,255,255,1))' }}>sturij</span>
            </div>

            {/* Right Nav - hidden on mobile, compact on tablet */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
              <button className="text-xs lg:text-sm font-light tracking-wide transition-colors" style={{ color: 'var(--tone-text-secondary, rgba(255,255,255,0.8))' }}>
                Materials
              </button>
              <button className="text-xs lg:text-sm font-light tracking-wide transition-colors" style={{ color: 'var(--tone-text-secondary, rgba(255,255,255,0.8))' }}>
                Commitment
              </button>
              <button className="text-xs lg:text-sm font-light tracking-wide transition-colors" style={{ color: 'var(--tone-text-secondary, rgba(255,255,255,0.8))' }}>
                Information
              </button>
              <button className="text-xs lg:text-sm font-light tracking-wide transition-colors" style={{ color: 'var(--tone-text-secondary, rgba(255,255,255,0.8))' }}>
                Contact
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Filter Tabs */}
      <div className="transition-colors" style={{ borderBottom: '1px solid var(--tone-light-20, rgba(255,255,255,0.1))' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 sm:gap-8 lg:gap-12 py-3 sm:py-4 overflow-x-auto scrollbar-hide">
            {Object.keys(filterOptions).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => toggleFilterTab(filterKey)}
                className={cn(
                  "text-xs sm:text-sm font-light tracking-wider uppercase transition-all whitespace-nowrap",
                  "hover:scale-105 flex-shrink-0"
                )}
                style={{ 
                  color: activeFilterTab === filterKey || filters[filterKey] !== "All"
                    ? 'var(--tone-text, rgba(255,255,255,1))' 
                    : 'var(--tone-text-muted, rgba(255,255,255,0.6))'
                }}
              >
                {filterKey}
              </button>
            ))}
          </div>
        </div>
        
        {/* Filter Dropdowns */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-3 sm:pb-4">
          {Object.keys(filterOptions).map((filterKey) => {
            if (filterKey === "swatches") {
              return (
                <AnimatePresence key={filterKey}>
                  {activeFilterTab === "swatches" && (
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
                        className="backdrop-blur-md rounded-lg mt-2 p-3 sm:p-6 shadow-2xl"
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
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                          <h3 className="text-xs sm:text-sm font-light tracking-wide" style={{ color: 'var(--tone-text, rgba(255,255,255,0.9))' }}>
                            Colour Palette
                          </h3>
                          <ColorToneSelector />
                        </div>
                        <CarouselLoop 
                          items={filteredMaterials}
                          renderItem={(m) => (
                            <Card className="overflow-hidden bg-white/5 backdrop-blur-sm border-white/10">
                              <div className="aspect-square relative">
                                <img 
                                  src={m.image} 
                                  alt={m.name}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => toggleFavorite(m.id)}
                                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                >
                                  <Heart 
                                    className={cn("w-4 h-4", favorites.includes(m.id) ? "fill-red-500 text-red-500" : "text-white")} 
                                  />
                                </button>
                              </div>
                              <div className="p-3">
                                <h4 className="font-medium text-white mb-1">{m.name}</h4>
                                <p className="text-xs text-white/60">{m.color} {m.texture} {m.finish}</p>
                              </div>
                            </Card>
                          )}
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            }
            
            if (filterKey === "favourites") {
              const favoriteMaterials = materials.filter(m => favorites.includes(m.id));
              return (
                <AnimatePresence key={filterKey}>
                  {activeFilterTab === "favourites" && (
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
                        className="backdrop-blur-md rounded-lg mt-2 p-3 sm:p-6 shadow-2xl"
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
                        {favoriteMaterials.length > 0 ? (
                          <CarouselLoop 
                            items={favoriteMaterials.map(m => ({
                              title: m.name,
                              imageSrc: m.image,
                              description: `${m.color} ${m.texture} ${m.finish}`,
                              isFavorite: true,
                              onFavoriteClick: () => toggleFavorite(m.id)
                            }))}
                          />
                        ) : (
                          <p className="text-center py-6 sm:py-8 text-xs sm:text-sm font-light tracking-wide" style={{ color: 'var(--tone-text-muted, rgba(255,255,255,0.6))' }}>
                            No favourites yet. Click the heart icon on swatches to add them.
                          </p>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            }
            
            return (
              <FilterDropdown
                key={filterKey}
                isOpen={activeFilterTab === filterKey}
                options={filterOptions[filterKey]}
                selectedValue={filters[filterKey === "colour" ? "color" : filterKey === "finishes" ? "finish" : filterKey]}
                onSelect={(value) => {
                  const actualKey = filterKey === "colour" ? "color" : filterKey === "finishes" ? "finish" : filterKey;
                  setFilters(prev => ({ ...prev, [actualKey]: value }));
                }}
                title={filterKey}
              />
            );
          })}
        </div>
      </div>



      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <svg className="absolute bottom-0 left-0 w-96 h-96" viewBox="0 0 200 200">
          <path 
            d="M 0,100 L 100,0 L 200,100 L 100,200 Z" 
            fill="white" 
            opacity="0.1"
          />
        </svg>
      </div>
    </div>
  );
}