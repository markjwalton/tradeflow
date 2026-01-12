import React, { useState } from 'react';
import ColorBlockPlaceholder from './ColorBlockPlaceholder';

export default function ImageWithPlaceholder({ 
  src, 
  alt = '', 
  width = '100%',
  height = '200px',
  colors,
  className = '' 
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {!loaded && (
        <ColorBlockPlaceholder 
          width={width} 
          height={height} 
          colors={colors}
          animate={true}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}