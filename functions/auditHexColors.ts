import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // List of files to audit
    const filesToAudit = [
      'pages/Home.js',
      'pages/Projects.js',
      'pages/Tasks.js',
      'pages/ProjectDetail.js',
      'pages/ThemeBuilder.js',
      'pages/FontManager.js',
      'pages/ThemePreview.js',
      'pages/ColorLibrary.js',
      'pages/DesignTokenEditor.js',
      'components/color-tools/OklchPaletteTool.js',
      'components/color-tools/OklchGradientTool.js',
      'components/color-tools/OklchColorTool.js',
      'components/color-tools/ColorLibrary.js',
      'components/ui/card.jsx',
      'components/layout/AppShell.js',
      'components/layout/AppSidebar.js',
      'components/layout/AppHeader.js',
      'components/page-builder/TopEditorPanel.js',
      'components/page-builder/PageSettingsPanel.js',
      'components/design-assistant/PageUIPanel.js',
      'Layout.js',
      'globals.css'
    ];

    const results = [];
    const hexPattern = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;

    for (const filePath of filesToAudit) {
      try {
        const response = await base44.asServiceRole.functions.invoke('readFileContent', { 
          file_path: filePath 
        });

        if (response.data?.content) {
          const content = response.data.content;
          const lines = content.split('\n');
          const hexMatches = [];
          
          lines.forEach((line, lineIndex) => {
            const matches = line.matchAll(hexPattern);
            for (const match of matches) {
              // Skip if it's in a comment about OKLCH or conversion
              if (line.includes('//') && line.toLowerCase().includes('oklch')) continue;
              if (line.includes('/*') || line.includes('*/')) continue;
              
              hexMatches.push({
                hex: match[0],
                line: lineIndex + 1,
                context: line.trim()
              });
            }
          });

          const hasOklch = content.toLowerCase().includes('oklch(');

          results.push({
            file: filePath,
            hex_count: hexMatches.length,
            hex_matches: hexMatches,
            has_oklch: hasOklch
          });
        }
      } catch (e) {
        results.push({
          file: filePath,
          error: e.message,
          hex_count: 0,
          hex_matches: []
        });
      }
    }

    return Response.json({ 
      success: true,
      results,
      summary: {
        total_files: results.length,
        files_with_hex: results.filter(r => r.hex_count > 0).length,
        total_hex_references: results.reduce((sum, r) => sum + r.hex_count, 0)
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});