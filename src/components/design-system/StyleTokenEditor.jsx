import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Paintbrush, Type, Ruler, Box as BoxIcon, Save, RefreshCw, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function ColorTokenEditor({ token, currentValue, onUpdate }) {
  const [isConverting, setIsConverting] = useState(false);
  const [hexFallback, setHexFallback] = useState('');
  const [oklchValue, setOklchValue] = useState('');

  // Parse current value to extract OKLCH and hex
  React.useEffect(() => {
    if (currentValue.includes('oklch')) {
      const oklchMatch = currentValue.match(/oklch\([^)]+\)/);
      const hexMatch = currentValue.match(/#[0-9a-fA-F]{6}/);
      setOklchValue(oklchMatch?.[0] || '');
      setHexFallback(hexMatch?.[0] || '#4a7c6b');
    } else if (currentValue.startsWith('#')) {
      setHexFallback(currentValue);
      setOklchValue('');
    }
  }, [currentValue]);

  const convertToOklch = async () => {
    if (!hexFallback) return;
    
    setIsConverting(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Convert this hex color ${hexFallback} to OKLCH format. Return ONLY the oklch() value, nothing else. Format: oklch(L C H) where L is 0-1, C is 0-0.4, H is 0-360.`,
        response_json_schema: {
          type: "object",
          properties: {
            oklch: { type: "string" }
          }
        }
      });
      
      const oklch = response.oklch || `oklch(0.65 0.15 160)`;
      setOklchValue(oklch);
      onUpdate(token, `${oklch}, ${hexFallback}`);
      toast.success('Converted to OKLCH');
    } catch (err) {
      toast.error('Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const convertToHex = async () => {
    if (!oklchValue) return;
    
    setIsConverting(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Convert this OKLCH color "${oklchValue}" to hex format. Return ONLY the hex value with #, nothing else.`,
        response_json_schema: {
          type: "object",
          properties: {
            hex: { type: "string" }
          }
        }
      });
      
      const hex = response.hex || '#4a7c6b';
      setHexFallback(hex);
      onUpdate(token, `${oklchValue}, ${hex}`);
      toast.success('Converted to Hex');
    } catch (err) {
      toast.error('Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const handleHexChange = (newHex) => {
    setHexFallback(newHex);
    if (oklchValue) {
      onUpdate(token, `${oklchValue}, ${newHex}`);
    } else {
      onUpdate(token, newHex);
    }
  };

  const handleOklchChange = (newOklch) => {
    setOklchValue(newOklch);
    onUpdate(token, `${newOklch}, ${hexFallback}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <Input
          type="color"
          value={hexFallback || '#4a7c6b'}
          onChange={(e) => handleHexChange(e.target.value)}
          className="w-20 h-10"
        />
        <Input
          type="text"
          value={hexFallback}
          onChange={(e) => handleHexChange(e.target.value)}
          className="w-28"
          placeholder="#000000"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={convertToOklch}
          disabled={isConverting}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          {isConverting ? 'Converting...' : 'To OKLCH'}
        </Button>
        <div 
          className="w-10 h-10 rounded border flex-shrink-0"
          style={{ backgroundColor: hexFallback }}
        />
      </div>
      {oklchValue && (
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            value={oklchValue}
            onChange={(e) => handleOklchChange(e.target.value)}
            className="font-mono text-xs flex-1"
            placeholder="oklch(0.65 0.15 160)"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={convertToHex}
            disabled={isConverting}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            To Hex
          </Button>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Format: {oklchValue ? `${oklchValue}, ${hexFallback}` : hexFallback}
      </p>
    </div>
  );
}

export function StyleTokenEditor({ tokens = [], onUpdate, componentName }) {
  const [localTokens, setLocalTokens] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Parse token type from name
  const getTokenType = (tokenName) => {
    if (tokenName.includes('color') || tokenName.includes('primary') || tokenName.includes('secondary')) return 'color';
    if (tokenName.includes('spacing') || tokenName.includes('padding') || tokenName.includes('margin')) return 'spacing';
    if (tokenName.includes('font') || tokenName.includes('text')) return 'typography';
    if (tokenName.includes('radius')) return 'radius';
    if (tokenName.includes('shadow')) return 'shadow';
    return 'other';
  };

  const groupedTokens = tokens.reduce((acc, token) => {
    const type = getTokenType(token);
    if (!acc[type]) acc[type] = [];
    acc[type].push(token);
    return acc;
  }, {});

  const getCurrentValue = (tokenName) => {
    if (localTokens[tokenName]) return localTokens[tokenName];
    const computed = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
    return computed;
  };

  const updateToken = (tokenName, value) => {
    setLocalTokens(prev => ({ ...prev, [tokenName]: value }));
    // Live preview
    document.documentElement.style.setProperty(tokenName, value);
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(localTokens);
      setLocalTokens({});
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    Object.keys(localTokens).forEach(token => {
      document.documentElement.style.removeProperty(token);
    });
    setLocalTokens({});
  };

  const hasChanges = Object.keys(localTokens).length > 0;

  return (
    <div className="space-y-4">
      {hasChanges && (
        <Card className="bg-primary/5 border-primary">
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge>
                {Object.keys(localTokens).length} token{Object.keys(localTokens).length !== 1 ? 's' : ''} modified
              </Badge>
              <span className="text-xs text-muted-foreground">
                Changes will apply site-wide
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="color" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="color">
            <Paintbrush className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="spacing">
            <Ruler className="h-4 w-4 mr-2" />
            Spacing
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="radius">
            <BoxIcon className="h-4 w-4 mr-2" />
            Radius
          </TabsTrigger>
          <TabsTrigger value="other">
            Other
          </TabsTrigger>
        </TabsList>

        {Object.entries(groupedTokens).map(([type, typeTokens]) => (
          <TabsContent key={type} value={type} className="space-y-3">
            {typeTokens.map(token => {
              const currentValue = getCurrentValue(token);
              const isModified = !!localTokens[token];

              return (
                <Card key={token} className={isModified ? 'border-primary' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-xs font-mono">{token}</Label>
                      {isModified && <Badge variant="outline" className="text-xs">Modified</Badge>}
                    </div>

                    {type === 'color' && (
                      <ColorTokenEditor
                        token={token}
                        currentValue={currentValue}
                        onUpdate={updateToken}
                      />
                    )}

                    {type === 'spacing' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Slider
                            value={[parseFloat(currentValue) || 0]}
                            onValueChange={([val]) => updateToken(token, `${val}rem`)}
                            max={10}
                            step={0.25}
                            className="flex-1"
                          />
                          <Input
                            type="text"
                            value={currentValue}
                            onChange={(e) => updateToken(token, e.target.value)}
                            className="w-24"
                          />
                        </div>
                      </div>
                    )}

                    {type === 'typography' && (
                      <Input
                        type="text"
                        value={currentValue}
                        onChange={(e) => updateToken(token, e.target.value)}
                        placeholder="1rem or 16px"
                      />
                    )}

                    {type === 'radius' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Slider
                            value={[parseFloat(currentValue) || 0]}
                            onValueChange={([val]) => updateToken(token, `${val}rem`)}
                            max={3}
                            step={0.125}
                            className="flex-1"
                          />
                          <Input
                            type="text"
                            value={currentValue}
                            onChange={(e) => updateToken(token, e.target.value)}
                            className="w-24"
                          />
                        </div>
                      </div>
                    )}

                    {type === 'other' && (
                      <Input
                        type="text"
                        value={currentValue}
                        onChange={(e) => updateToken(token, e.target.value)}
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}