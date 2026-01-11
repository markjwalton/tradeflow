import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ColorToneSelector from "@/components/sturij/ColorToneSelector";

// Mock data - replace with actual data source later
const materials = [
  { id: 1, name: "Lissa Oak", image: "https://images.unsplash.com/photo-1563291074-2bf8677ac0e5?w=400", category: "Wood", color: "Light", texture: "Smooth", finish: "Matt", style: "Contemporary" },
  { id: 2, name: "Lissa Oak", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400", category: "Wood", color: "Dark", texture: "Textured", finish: "Matt", style: "Traditional" },
  { id: 3, name: "Lissa Oak", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400", category: "Wood", color: "Dark", texture: "Smooth", finish: "Satin", style: "Contemporary" },
  { id: 4, name: "Lissa Oak", image: "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400", category: "Wood", color: "Dark", texture: "Textured", finish: "Matt", style: "Rustic" },
  { id: 5, name: "Lissa Oak", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400", category: "Wood", color: "Light", texture: "Smooth", finish: "Gloss", style: "Contemporary" },
  { id: 6, name: "Lissa Oak", image: "https://images.unsplash.com/photo-1604066867775-43f48e3957d8?w=400", category: "Wood", color: "Light", texture: "Textured", finish: "Matt", style: "Natural" },
  { id: 7, name: "Lissa Oak", image: "https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?w=400", category: "Wood", color: "Light", texture: "Smooth", finish: "Satin", style: "Contemporary" },
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
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(false);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const filterOptions = {
    color: ["All", "Light", "Dark"],
    texture: ["All", "Smooth", "Textured"],
    finish: ["All", "Matt", "Satin", "Gloss"],
    style: ["All", "Contemporary", "Traditional", "Rustic", "Natural"]
  };

  const filteredMaterials = materials.filter(material => {
    return Object.keys(filters).every(key => 
      filters[key] === "All" || material[key] === filters[key]
    );
  });

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--tone-base, #65617d)' }}>
      {/* Top Navigation */}
      <nav className="bg-transparent transition-colors" style={{ borderBottom: '1px solid var(--tone-light-20, rgba(255,255,255,0.1))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <button className="text-white/80 hover:text-white text-sm font-light tracking-wide">
                About
              </button>
              <button className="text-white/80 hover:text-white text-sm font-light tracking-wide">
                Design
              </button>
              <button className="text-white/80 hover:text-white text-sm font-light tracking-wide">
                Manufacture
              </button>
              <button className="text-white/80 hover:text-white text-sm font-light tracking-wide">
                Installation
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white/20" />
              </div>
              <span className="text-white text-xl font-light tracking-widest">sturij</span>
            </div>

            <div className="flex items-center gap-8">
              <button className="text-white/80 hover:text-white text-sm font-light tracking-wide">
                Materials
              </button>
              <button className="text-white/80 hover:text-white text-sm font-light tracking-wide">
                Commitment
              </button>
              <button className="text-white/80 hover:text-white text-sm font-light tracking-wide">
                Information
              </button>
              <button className="text-white/80 hover:text-white text-sm font-light tracking-wide">
                Contact
              </button>
              <ColorToneSelector />
              <button className="text-red-400 hover:text-red-300">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Filter Tabs */}
      <div className="transition-colors" style={{ borderBottom: '1px solid var(--tone-light-20, rgba(255,255,255,0.1))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-12 py-4">
            {Object.keys(filterOptions).map((filterKey) => (
              <button
                key={filterKey}
                className={cn(
                  "text-sm font-light tracking-wider uppercase",
                  filters[filterKey] !== "All" 
                    ? "text-white" 
                    : "text-white/60 hover:text-white/80"
                )}
              >
                {filterKey}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-56 flex-shrink-0">
            <Card className="backdrop-blur-sm p-4 transition-colors" style={{ backgroundColor: 'var(--tone-light-10, rgba(255,255,255,0.05))', borderColor: 'var(--tone-light-20, rgba(255,255,255,0.1))' }}>
              {/* Category Filter */}
              <div className="mb-4">
                <button
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="flex items-center justify-between w-full text-white/80 hover:text-white text-sm tracking-wide mb-2"
                >
                  <span>{selectedCategory}</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", categoryOpen && "rotate-180")} />
                </button>
                {categoryOpen && (
                  <div className="space-y-1 pl-2">
                    <button className="block text-white/60 hover:text-white text-sm">
                      All
                    </button>
                  </div>
                )}
              </div>

              {/* Color Filter */}
              <div>
                <button
                  onClick={() => setColorOpen(!colorOpen)}
                  className="flex items-center justify-between w-full text-white/80 hover:text-white text-sm tracking-wide mb-2"
                >
                  <span>Colour</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", colorOpen && "rotate-180")} />
                </button>
                {colorOpen && (
                  <div className="space-y-2 pl-2">
                    {filterOptions.color.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFilters(prev => ({ ...prev, color }))}
                        className={cn(
                          "flex items-center gap-2 text-sm w-full text-left",
                          filters.color === color ? "text-white" : "text-white/60 hover:text-white"
                        )}
                      >
                        <div className={cn(
                          "w-3 h-3 rounded-sm border border-white/30",
                          color === "Dark" && "bg-gray-800",
                          color === "Light" && "bg-gray-300"
                        )} />
                        {color}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Materials Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMaterials.map((material) => (
                <Card 
                  key={material.id}
                  className="group backdrop-blur-sm overflow-hidden transition-all"
                  style={{ 
                    backgroundColor: 'var(--tone-light-10, rgba(255,255,255,0.05))',
                    borderColor: 'var(--tone-light-20, rgba(255,255,255,0.1))'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--tone-light-30, rgba(255,255,255,0.3))'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--tone-light-20, rgba(255,255,255,0.1))'}
                >
                  <div className="relative aspect-square">
                    <img 
                      src={material.image} 
                      alt={material.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => toggleFavorite(material.id)}
                      className="absolute top-2 right-2 p-2 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 transition-colors"
                    >
                      <Heart 
                        className={cn(
                          "h-4 w-4 transition-colors",
                          favorites.includes(material.id) 
                            ? "fill-red-400 text-red-400" 
                            : "text-white/80"
                        )}
                      />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="text-white/90 text-sm font-light tracking-wide text-center">
                      {material.name}
                    </h3>
                  </div>
                </Card>
              ))}
            </div>
          </div>
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