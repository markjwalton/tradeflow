import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mode = 'list', files = [] } = await req.json();

    // LIST MODE: Get all files
    if (mode === 'list') {
      // Comprehensive list of common files to audit
      const allFiles = [
        'Layout.js',
        'globals.css',
        // Color tools
        'components/color-tools/ColorLibrary.jsx',
        'components/color-tools/OklchBulkConverter.jsx',
        'components/color-tools/OklchColorTool.jsx',
        'components/color-tools/OklchGradientTool.jsx',
        'components/color-tools/OklchPaletteTool.jsx',
        // Design system
        'components/design-system/ThemeTokenEditor.jsx',
        'components/design-assistant/PageUIPanel.jsx',
        'components/design-assistant/StyleInspectorOverlay.jsx',
        // Library
        'components/library/designTokens.jsx',
        'components/library/Layouts.jsx',
        'components/library/Typography.jsx',
        'components/library/Buttons.jsx',
        'components/library/Cards.jsx',
        'components/library/Forms.jsx',
        'components/library/CompactButton.jsx',
        // Page builder
        'components/page-builder/EditModeContext.jsx',
        'components/page-builder/PageSettingsPanel.jsx',
        'components/page-builder/LiveEditWrapper.jsx',
        'components/page-builder/TopEditorPanel.jsx',
        'components/page-builder/editorTokens.jsx',
        // Layout
        'components/layout/AppShell.jsx',
        'components/layout/AppHeader.jsx',
        'components/layout/AppSidebar.jsx',
        'components/layout/PageContainer.jsx',
        // UI components
        'components/ui/card.jsx',
        'components/ui/button.jsx',
        'components/ui/input.jsx',
        'components/ui/badge.jsx',
        'components/ui/alert.jsx',
        // Pages
        'pages/ColorAudit.jsx',
        'pages/OklchColorPicker.jsx',
        'pages/ThemeBuilder.jsx',
        'pages/ThemePreview.jsx',
        'pages/FontManager.jsx',
        'pages/DesignTokenEditor.jsx',
        'pages/SiteSettings.jsx',
        'pages/NavigationManager.jsx',
        'pages/Home.jsx',
        'pages/Dashboard.jsx',
        'pages/Projects.jsx',
        'pages/Tasks.jsx',
        'pages/Customers.jsx',
        'pages/Team.jsx'
      ];

      return Response.json({ 
        success: true,
        files: allFiles,
        total: allFiles.length
      });
    }

    // SCAN MODE: Scan specific files
    const batchFiles = files;

    const results = [];
    const hexPattern = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;

    for (const filePath of batchFiles) {
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
      results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});