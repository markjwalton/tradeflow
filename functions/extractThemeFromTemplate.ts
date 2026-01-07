import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templatePage, websiteFolderId, themeName } = await req.json();

    // Use AI to analyze the template page and extract design tokens
    const prompt = `Analyze the ${templatePage} template page and extract all design tokens and styles into a structured theme.

EXTRACT:
1. Color palette (primary, secondary, accent, backgrounds, text colors)
2. Typography (font families, sizes, weights, line heights)
3. Spacing scale (margins, padding)
4. Border radius values
5. Shadow definitions
6. Component-specific styles (buttons, cards, inputs)

Based on the ${templatePage} page which uses Radiant design system, extract the actual CSS custom properties and Tailwind classes being used.

Return ONLY valid JSON with this structure:
{
  "name": "${themeName || templatePage + ' Theme'}",
  "colors": {
    "primary": { "50": "#...", "100": "#...", "500": "#...", "600": "#..." },
    "secondary": { "50": "#...", "100": "#...", "500": "#..." },
    "background": "#...",
    "foreground": "#...",
    "muted": "#..."
  },
  "typography": {
    "fontFamily": {
      "display": "degular-display, sans-serif",
      "body": "mrs-eaves-xl-serif-narrow, serif"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "6xl": "3.75rem"
    }
  },
  "spacing": {
    "xs": "0.5rem",
    "sm": "0.75rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem"
  },
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
    "2xl": "2rem"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
  }
}`;

    const themeData = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          colors: {
            type: "object",
            properties: {
              primary: { type: "object" },
              secondary: { type: "object" },
              background: { type: "string" },
              foreground: { type: "string" }
            }
          },
          typography: {
            type: "object",
            properties: {
              fontFamily: { type: "object" },
              fontSize: { type: "object" }
            }
          },
          spacing: { type: "object" },
          borderRadius: { type: "object" },
          shadows: { type: "object" }
        }
      }
    });

    // Generate CSS variables from theme
    const cssVariables = generateCSSVariables(themeData);

    // Create WebsiteTheme entity
    const theme = await base44.asServiceRole.entities.WebsiteTheme.create({
      name: themeData.name,
      description: `Extracted from ${templatePage} template`,
      theme_data: themeData,
      css_variables: cssVariables,
      is_active: true
    });

    // Link theme to website folder if provided
    if (websiteFolderId) {
      await base44.asServiceRole.entities.WebsiteFolder.update(websiteFolderId, {
        theme_id: theme.id
      });
    }

    return Response.json({
      success: true,
      theme: theme,
      message: 'Theme extracted and saved successfully'
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

function generateCSSVariables(themeData) {
  let css = ':root {\n';
  
  // Colors
  if (themeData.colors?.primary) {
    Object.entries(themeData.colors.primary).forEach(([key, value]) => {
      css += `  --primary-${key}: ${value};\n`;
    });
  }
  
  // Typography
  if (themeData.typography?.fontFamily) {
    Object.entries(themeData.typography.fontFamily).forEach(([key, value]) => {
      css += `  --font-family-${key}: ${value};\n`;
    });
  }
  
  if (themeData.typography?.fontSize) {
    Object.entries(themeData.typography.fontSize).forEach(([key, value]) => {
      css += `  --text-${key}: ${value};\n`;
    });
  }
  
  // Spacing
  if (themeData.spacing) {
    Object.entries(themeData.spacing).forEach(([key, value]) => {
      css += `  --spacing-${key}: ${value};\n`;
    });
  }
  
  // Border radius
  if (themeData.borderRadius) {
    Object.entries(themeData.borderRadius).forEach(([key, value]) => {
      css += `  --radius-${key}: ${value};\n`;
    });
  }
  
  css += '}';
  return css;
}