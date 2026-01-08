import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export function StyleCategory({ 
  title, 
  currentValue, 
  isLive, 
  isApplicable = true,
  isEdited = false,
  isExpanded = false,
  onToggle,
  children 
}) {
  return (
    <div className="border-b">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${!isApplicable ? 'opacity-40' : ''}`}
        disabled={!isApplicable}
      >
        <span className="font-medium">{title}</span>
        <div className="flex items-center gap-3">
          <div 
            className={`w-3 h-3 rounded-full ${
              isEdited ? 'bg-amber-500' : isLive ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={isEdited ? 'Edited - unsaved changes' : isLive ? 'Live themed value' : 'Default/unmanaged value'}
          />
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </button>
      {isExpanded && isApplicable && (
        <div className="p-4 bg-muted/20 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function StyleProperty({ label, value, onChange, type = 'text', options = [], min, max, step, disabled = false }) {
  if (type === 'select') {
    return (
      <div className="space-y-1">
        <Label className={`text-xs ${disabled ? 'opacity-40' : ''}`}>{label}</Label>
        <select
          className="w-full px-3 py-2 border rounded-md text-sm bg-background disabled:opacity-40 disabled:cursor-not-allowed"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (type === 'slider') {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className={`text-xs ${disabled ? 'opacity-40' : ''}`}>{label}</Label>
          <span className={`text-xs font-mono text-muted-foreground ${disabled ? 'opacity-40' : ''}`}>{value}</span>
        </div>
        <Slider
          value={[parseFloat(value) || 0]}
          onValueChange={([val]) => onChange(`${val}${step < 1 ? 'rem' : 'px'}`)}
          min={min || 0}
          max={max || 100}
          step={step || 1}
          disabled={disabled}
          className="disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>
    );
  }

  if (type === 'color') {
    return (
      <div className="space-y-1">
        <Label className={`text-xs ${disabled ? 'opacity-40' : ''}`}>{label}</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-16 h-10 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={disabled}
          />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 font-mono text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label className={`text-xs ${disabled ? 'opacity-40' : ''}`}>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={disabled}
      />
    </div>
  );
}