import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, X, Check, Move, ZoomIn, ZoomOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function BackgroundImageEditor({ value, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Target dimensions for background (wide format)
  const TARGET_WIDTH = 1920;
  const TARGET_HEIGHT = 1080;

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      drawCanvas();
    }
  }, [imageSrc, scale, position]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImageSrc(event.target.result);
        
        // Calculate initial scale to fit
        const scaleX = TARGET_WIDTH / img.width;
        const scaleY = TARGET_HEIGHT / img.height;
        const initialScale = Math.max(scaleX, scaleY);
        
        setScale(initialScale);
        setPosition({ x: 0, y: 0 });
        setIsEditing(true);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;

    // Clear canvas
    ctx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    // Draw background (optional checkerboard pattern)
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    // Calculate scaled dimensions
    const scaledWidth = imageRef.current.width * scale;
    const scaledHeight = imageRef.current.height * scale;

    // Center the image and apply position offset
    const x = (TARGET_WIDTH - scaledWidth) / 2 + position.x;
    const y = (TARGET_HEIGHT - scaledHeight) / 2 + position.y;

    // Draw image
    ctx.drawImage(imageRef.current, x, y, scaledWidth, scaledHeight);

    // Draw border/mask
    ctx.strokeStyle = '#4a7c6b';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (direction) => {
    const delta = direction === 'in' ? 0.1 : -0.1;
    const newScale = Math.max(0.1, Math.min(5, scale + delta));
    setScale(newScale);
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      // Convert canvas to blob
      const canvas = canvasRef.current;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      
      // Upload to base44
      const formData = new FormData();
      formData.append('file', blob, 'background.jpg');
      
      const result = await base44.integrations.Core.UploadFile({ file: blob });
      
      onChange(result.file_url);
      setIsEditing(false);
      setImageSrc(null);
      toast.success('Background image saved');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setImageSrc(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (isEditing && imageSrc) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Label>Position and resize your background image</Label>
            
            <div className="relative border-2 border-primary rounded-lg overflow-hidden bg-muted/30" style={{ aspectRatio: `${TARGET_WIDTH}/${TARGET_HEIGHT}` }}>
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleZoom('out')}
                  className="bg-white/90 hover:bg-white"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleZoom('in')}
                  className="bg-white/90 hover:bg-white"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                <Move className="h-3 w-3 inline mr-1" />
                Drag to reposition • Zoom: {Math.round(scale * 100)}%
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={uploading}>
                <Check className="h-4 w-4 mr-2" />
                {uploading ? 'Saving...' : 'Save Image'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      
      {value ? (
        <div className="space-y-2">
          <Label>Current Background</Label>
          <div className="relative rounded-lg overflow-hidden border h-32">
            <img 
              src={value} 
              alt="Background preview"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onChange(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full h-32 border-dashed"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium text-primary">Click to upload</span>
              <span className="text-muted-foreground"> or drag and drop</span>
            </div>
            <span className="text-xs text-muted-foreground">Recommended: 1920x1080px</span>
          </div>
        </Button>
      )}
    </div>
  );
}