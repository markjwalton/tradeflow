import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Paintbrush, Type, Ruler, Box as BoxIcon, Save, RefreshCw, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function ColorTokenEditor({ token, currentValue, onUpdate, allColorTokens = [] }) {
  const [isConverting, setIsConverting] = useState(false);
  const [hexFallback, setHexFallback] = useState('');
  const [oklchValue, setOklchValue] = useState('');
  const [alpha, setAlpha] = useState(1);
  const [transparencyMode, setTransparencyMode] = useState('none');
  const [defaultValue, setDefaultValue] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(token);

  // Get default value from stylesheet
  React.useEffect(() => {
    const sheets = Array.from(document.styleSheets);
    for (const sheet of sheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        for (const rule of rules) {
          if (rule.selectorText === ':root') {
            const val = rule.style.getPropertyValue(token);
            if (val) {
              setDefaultValue(val.trim());
              break;
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheet
      }
    }
  }, [token]);

  // Get color family variants
  const getColorVariants = () => {
    const tokenBase = token.replace(/(-\d+|-foreground)$/, '');
    return allColorTokens.filter(t => t.startsWith(tokenBase) && t !== token);
  };

  const colorVariants = getColorVariants();

  // Parse current value to extract OKLCH and hex
  React.useEffect(() => {
    if (currentValue.includes('oklch')) {
      const oklchMatch = currentValue.match(/oklch\([^)]+\)/);
      const hexMatch = currentValue.match(/#[0-9a-fA-F]{6}/);
      const alphaMatch = currentValue.match(/\/\s*([\d.]+)/);
      setOklchValue(oklchMatch?.[0] || '');
      setHexFallback(hexMatch?.[0] || '#4a7c6b');
      const alphaVal = alphaMatch ? parseFloat(alphaMatch[1]) : 1;
      setAlpha(alphaVal);
      setTransparencyMode(alphaVal < 1 ? 'custom' : 'none');
    } else if (currentValue.startsWith('#')) {
      setHexFallback(currentValue);
      setOklchValue('');
      setAlpha(1);
      setTransparencyMode('none');
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
    const alphaStr = alpha < 1 ? ` / ${alpha}` : '';
    if (oklchValue) {
      onUpdate(token, `${oklchValue}${alphaStr}, ${newHex}`);
    } else {
      onUpdate(token, newHex);
    }
  };

  const handleOklchChange = (newOklch) => {
    setOklchValue(newOklch);
    const alphaStr = alpha < 1 ? ` / ${alpha}` : '';
    onUpdate(token, `${newOklch}${alphaStr}, ${hexFallback}`);
  };

  const handleAlphaChange = (newAlpha) => {
    setAlpha(newAlpha);
    const alphaStr = newAlpha < 1 ? ` / ${newAlpha}` : '';
    if (oklchValue) {
      onUpdate(token, `${oklchValue}${alphaStr}, ${hexFallback}`);
    }
  };

  const handleTransparencyChange = (mode) => {
    setTransparencyMode(mode);
    if (mode === 'none') {
      setAlpha(1);
      if (oklchValue) {
        onUpdate(token, `${oklchValue}, ${hexFallback}`);
      }
    }
  };

  const handleVariantChange = (newToken) => {
    setSelectedVariant(newToken);
    const newValue = getComputedStyle(document.documentElement).getPropertyValue(newToken).trim();
    if (newValue) {
      // Parse the new value and update
      if (newValue.includes('oklch')) {
        const oklchMatch = newValue.match(/oklch\([^)]+\)/);
        const hexMatch = newValue.match(/#[0-9a-fA-F]{6}/);
        setOklchValue(oklchMatch?.[0] || '');
        setHexFallback(hexMatch?.[0] || '#4a7c6b');
        onUpdate(token, newValue);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Classname display */}
      <div className="p-2 bg-muted rounded-md font-mono text-xs">
        <span className="text-muted-foreground">var(</span>
        <span className="text-primary">{token}</span>
        <span className="text-muted-foreground">)</span>
      </div>

      {/* Color swatch and hex input */}
      <div className="flex gap-2 items-center">
        <div 
          className="w-12 h-12 rounded-md border-2 flex-shrink-0 shadow-sm"
          style={{ backgroundColor: hexFallback }}
          title={hexFallback}
        />
        <Input
          type="color"
          value={hexFallback || '#4a7c6b'}
          onChange={(e) => handleHexChange(e.target.value)}
          className="w-16 h-10 cursor-pointer"
        />
        <Input
          type="text"
          value={hexFallback}
          onChange={(e) => handleHexChange(e.target.value)}
          className="flex-1 font-mono text-sm"
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
      </div>

      {/* Stylesheet default */}
      {defaultValue && (
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold">Stylesheet default:</span> {defaultValue}
        </div>
      )}

      {/* Color variants dropdown */}
      {colorVariants.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs">Load from variant</Label>
          <select
            className="w-full px-3 py-2 border rounded-md text-sm font-mono bg-background"
            value={selectedVariant}
            onChange={(e) => handleVariantChange(e.target.value)}
          >
            <option value={token}>{token}</option>
            {colorVariants.map(variant => (
              <option key={variant} value={variant}>{variant}</option>
            ))}
          </select>
        </div>
      )}
      {oklchValue && (
        <>
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
          
          {/* Transparency control */}
          <div className="space-y-2">
            <Label className="text-xs">Transparency</Label>
            <select
              className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              value={transparencyMode}
              onChange={(e) => handleTransparencyChange(e.target.value)}
            >
              <option value="none">None (100%)</option>
              <option value="custom">Custom</option>
            </select>
            {transparencyMode === 'custom' && (
              <div className="space-y-1 pt-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs">Opacity</Label>
                  <span className="text-xs font-mono text-muted-foreground">{(alpha * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[alpha]}
                  onValueChange={([val]) => handleAlphaChange(val)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function StyleTokenEditor({ tokens = [], onUpdate, componentName }) {
  const [localTokens, setLocalTokens] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Parse token type from name
  const getTokenType = (tokenName) => {
    if (tokenName.includes('color') || tokenName.includes('primary') || tokenName.includes('secondary') || tokenName.includes('accent') || tokenName.includes('destructive') || tokenName.includes('midnight') || tokenName.includes('charcoal')) return 'color';
    if (tokenName.includes('spacing') || tokenName.includes('padding') || tokenName.includes('margin')) return 'spacing';
    if (tokenName.includes('font') || tokenName.includes('text') || tokenName.includes('leading') || tokenName.includes('tracking') || tokenName.includes('word-spacing') || tokenName.includes('paragraph-spacing')) return 'typography';
    if (tokenName.includes('radius')) return 'radius';
    if (tokenName.includes('shadow')) return 'shadow';
    return 'other';
  };

  // Filter tokens based on component type
  const getRelevantTokens = (allTokens) => {
    const name = componentName?.toLowerCase() || '';
    
    if (name.includes('button')) {
      return allTokens.filter(t => 
        t.includes('color') || t.includes('primary') || t.includes('radius') || 
        t.includes('spacing') || t.includes('shadow') || t.includes('font')
      );
    }
    
    if (name.includes('card')) {
      return allTokens.filter(t =>
        t.includes('color') || t.includes('card') || t.includes('radius') ||
        t.includes('spacing') || t.includes('shadow') || t.includes('border')
      );
    }
    
    if (name.includes('typography') || name.includes('text') || name.includes('heading')) {
      return allTokens.filter(t =>
        t.includes('font') || t.includes('text') || t.includes('color') ||
        t.includes('leading') || t.includes('tracking')
      );
    }
    
    if (name.includes('badge')) {
      return allTokens.filter(t =>
        t.includes('color') || t.includes('radius') || t.includes('text') ||
        t.includes('spacing')
      );
    }
    
    return allTokens;
  };

  const relevantTokens = getRelevantTokens(tokens);

  const groupedTokens = relevantTokens.reduce((acc, token) => {
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
    console.log('[StyleTokenEditor] updateToken called:', tokenName, '=', value);
    setLocalTokens(prev => ({ ...prev, [tokenName]: value }));
    // Live preview
    document.documentElement.style.setProperty(tokenName, value);
    console.log('[StyleTokenEditor] CSS variable set, dispatching event');
    // Notify preview to refresh
    window.dispatchEvent(new CustomEvent('css-variables-updated'));
  };

  const handleSave = async () => {
    console.log('[StyleTokenEditor] handleSave called with:', localTokens);
    setIsUpdating(true);
    try {
      await onUpdate(localTokens);
      console.log('[StyleTokenEditor] Save successful');
      toast.success('Tokens saved successfully');
      setLocalTokens({});
    } catch (error) {
      console.error('[StyleTokenEditor] Save error:', error);
      toast.error('Failed to save tokens');
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

      {Object.keys(groupedTokens).length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No editable tokens found for this component
          </CardContent>
        </Card>
      )}

      {Object.keys(groupedTokens).length > 0 && (
        <Tabs defaultValue={Object.keys(groupedTokens)[0]} className="w-full">
          <TabsList className={`grid w-full grid-cols-${Math.min(Object.keys(groupedTokens).length, 5)}`}>
            {groupedTokens.color && (
              <TabsTrigger value="color">
                <Paintbrush className="h-4 w-4 mr-2" />
                Colors
              </TabsTrigger>
            )}
            {groupedTokens.spacing && (
              <TabsTrigger value="spacing">
                <Ruler className="h-4 w-4 mr-2" />
                Spacing
              </TabsTrigger>
            )}
            {groupedTokens.typography && (
              <TabsTrigger value="typography">
                <Type className="h-4 w-4 mr-2" />
                Typography
              </TabsTrigger>
            )}
            {groupedTokens.radius && (
              <TabsTrigger value="radius">
                <BoxIcon className="h-4 w-4 mr-2" />
                Radius
              </TabsTrigger>
            )}
            {groupedTokens.shadow && (
              <TabsTrigger value="shadow">
                Shadow
              </TabsTrigger>
            )}
            {groupedTokens.other && (
              <TabsTrigger value="other">
                Other
              </TabsTrigger>
            )}
          </TabsList>

          {Object.entries(groupedTokens).map(([type, typeTokens]) => (
            <TabsContent key={type} value={type} className="space-y-3 mt-4">
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
                       allColorTokens={typeTokens}
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
                      <>
                        {(token.includes('leading') || token.includes('tracking') || token.includes('word-spacing') || token.includes('paragraph-spacing')) ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Slider
                                value={[parseFloat(currentValue) || (token.includes('paragraph-spacing') ? 1 : token.includes('word-spacing') ? 0 : 1)]}
                                onValueChange={([val]) => {
                                  if (token.includes('paragraph-spacing')) {
                                    updateToken(token, `${val}rem`);
                                  } else if (token.includes('word-spacing') || token.includes('tracking')) {
                                    updateToken(token, `${val}em`);
                                  } else {
                                    updateToken(token, `${val}`);
                                  }
                                }}
                                min={token.includes('word-spacing') || token.includes('tracking') ? -0.1 : token.includes('paragraph-spacing') ? 0 : 1}
                                max={token.includes('word-spacing') ? 0.3 : token.includes('tracking') ? 0.2 : token.includes('paragraph-spacing') ? 3 : 2.5}
                                step={token.includes('word-spacing') || token.includes('tracking') ? 0.005 : token.includes('paragraph-spacing') ? 0.25 : 0.125}
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
                        ) : (
                          <Input
                            type="text"
                            value={currentValue}
                            onChange={(e) => updateToken(token, e.target.value)}
                            placeholder="1rem or 16px"
                          />
                        )}
                      </>
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
      )}
    </div>
  );
}