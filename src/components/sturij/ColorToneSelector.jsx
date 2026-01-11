import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";

// Categorized colors from Farrow & Ball
const colorGroups = {
  "Neutrals & Whites": [
    { name: "Wevet", hex: "#E8E6E0" },
    { name: "All White", hex: "#F2F1ED" },
    { name: "Ammonite", hex: "#E3DFD9" },
    { name: "Strong White", hex: "#E8E6E0" },
    { name: "Pointing", hex: "#E9E6DF" },
    { name: "Cornforth White", hex: "#DDD9D3" },
    { name: "Elephant's Breath", hex: "#D4CFCA" },
    { name: "Skimming Stone", hex: "#DDD9D1" },
    { name: "Pavilion Gray", hex: "#D4D0CA" },
    { name: "Dove Tale", hex: "#CFCBC5" },
  ],
  "Greens & Earth Tones": [
    { name: "Sap Green", hex: "#7F8662" },
    { name: "Dibber", hex: "#7D7E5F" },
    { name: "Reduced Green", hex: "#717463" },
    { name: "Calke Green", hex: "#7b8b71" },
    { name: "Breakfast Room Green", hex: "#93a88d" },
    { name: "Yeabridge Green", hex: "#8b9d75" },
    { name: "Green Smoke", hex: "#727f75" },
    { name: "Card Room Green", hex: "#8b9284" },
    { name: "Teresa's Green", hex: "#bfcec4" },
    { name: "Green Blue", hex: "#aebfb5" },
  ],
  "Blues & Grays": [
    { name: "Hague Blue", hex: "#41505a" },
    { name: "Stiffkey Blue", hex: "#495a6a" },
    { name: "Oval Room Blue", hex: "#819595" },
    { name: "Parma Gray", hex: "#abbac3" },
    { name: "Lulworth Blue", hex: "#a2b9c9" },
    { name: "Stone Blue", hex: "#7799a4" },
    { name: "Inchyra Blue", hex: "#4b5c5e" },
    { name: "De Nimes", hex: "#6e7e83" },
    { name: "Down Pipe", hex: "#636b6a" },
    { name: "Railings", hex: "#484c4f" },
  ],
  "Pinks & Reds": [
    { name: "Calamine", hex: "#E5CBCA" },
    { name: "Middleton Pink", hex: "#E8D4D3" },
    { name: "Nancy's Blushes", hex: "#E5ACA8" },
    { name: "Sulking Room Pink", hex: "#B89093" },
    { name: "Cinder Rose", hex: "#C4A2A3" },
    { name: "Incarnadine", hex: "#9f4849" },
    { name: "Eating Room Red", hex: "#99645E" },
    { name: "Rectory Red", hex: "#A84F51" },
    { name: "Rangwali", hex: "#B57D86" },
    { name: "Picture Gallery Red", hex: "#BA7A66" },
  ],
  "Warm Tones": [
    { name: "Etruscan Red", hex: "#A67365" },
    { name: "Red Earth", hex: "#C6826D" },
    { name: "Charlotte's Locks", hex: "#D17852" },
    { name: "Bamboozle", hex: "#B56D52" },
    { name: "London Clay", hex: "#8A7D71" },
    { name: "Setting Plaster", hex: "#E3D3C5" },
    { name: "Pink Ground", hex: "#E5D4C8" },
    { name: "Templeton Pink", hex: "#D9C5B3" },
    { name: "India Yellow", hex: "#c7a061" },
    { name: "Sudbury Yellow", hex: "#d8b77a" },
  ],
  "Darks & Blacks": [
    { name: "Railings", hex: "#484c4f" },
    { name: "Off-Black", hex: "#48494b" },
    { name: "Pitch Black", hex: "#3f3d3e" },
    { name: "Paean Black", hex: "#3E3D42" },
    { name: "Studio Green", hex: "#49504d" },
    { name: "Tanner's Brown", hex: "#4B4540" },
    { name: "Brinjal", hex: "#61454a" },
    { name: "Preference Red", hex: "#6A4750" },
  ],
};

// Generate shades from a base color
const generateShades = (hexColor) => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const shades = {};
  
  // Lighter shades (for backgrounds, hovers)
  [10, 20, 30].forEach(percent => {
    const factor = 1 + (percent / 100);
    const newR = Math.min(255, Math.round(r * factor));
    const newG = Math.min(255, Math.round(g * factor));
    const newB = Math.min(255, Math.round(b * factor));
    shades[`light-${percent}`] = `rgb(${newR}, ${newG}, ${newB})`;
  });

  // Base color
  shades.base = hexColor;

  // Darker shades (for text, borders)
  [10, 20, 30, 40].forEach(percent => {
    const factor = 1 - (percent / 100);
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    shades[`dark-${percent}`] = `rgb(${newR}, ${newG}, ${newB})`;
  });

  return shades;
};

export default function ColorToneSelector({ onColorChange }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [open, setOpen] = useState(false);

  const applyColorTone = (color) => {
    const shades = generateShades(color.hex);
    
    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--tone-base', shades.base);
    root.style.setProperty('--tone-light-10', shades['light-10']);
    root.style.setProperty('--tone-light-20', shades['light-20']);
    root.style.setProperty('--tone-light-30', shades['light-30']);
    root.style.setProperty('--tone-dark-10', shades['dark-10']);
    root.style.setProperty('--tone-dark-20', shades['dark-20']);
    root.style.setProperty('--tone-dark-30', shades['dark-30']);
    root.style.setProperty('--tone-dark-40', shades['dark-40']);

    if (onColorChange) {
      onColorChange(color, shades);
    }
    
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-white/80 hover:text-white hover:bg-white/10">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Set the tone</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <h3 className="font-medium text-sm mb-3">Set the tone</h3>
          
          {!selectedGroup ? (
            <div className="space-y-2">
              {Object.keys(colorGroups).map((groupName) => (
                <button
                  key={groupName}
                  onClick={() => setSelectedGroup(groupName)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm transition-colors"
                >
                  {groupName}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-xs text-muted-foreground hover:text-foreground mb-3"
              >
                ← Back to categories
              </button>
              <div className="grid grid-cols-2 gap-2">
                {colorGroups[selectedGroup].map((color) => (
                  <button
                    key={color.name}
                    onClick={() => applyColorTone(color)}
                    className="group flex flex-col items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-md border border-border shadow-sm group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs text-center leading-tight">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}