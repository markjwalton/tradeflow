import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { batch = 0, batchSize = 20 } = await req.json();

    // Get all pages and components
    const allFiles = [];
    
    // Get all pages
    try {
      const pagesResponse = await base44.asServiceRole.functions.invoke('readFileContent', { 
        file_path: 'pages' 
      });
      if (pagesResponse.data?.files) {
        allFiles.push(...pagesResponse.data.files.map(f => `pages/${f}`));
      }
    } catch (e) {
      console.log('Could not list pages:', e.message);
    }

    // Get all components
    try {
      const componentsResponse = await base44.asServiceRole.functions.invoke('readFileContent', { 
        file_path: 'components' 
      });
      if (componentsResponse.data?.files) {
        allFiles.push(...componentsResponse.data.files.map(f => `components/${f}`));
      }
    } catch (e) {
      console.log('Could not list components:', e.message);
    }

    // Add critical files
    allFiles.push('Layout.js', 'globals.css');

    // Filter to only JS/JSX/CSS files
    const filesToAudit = allFiles.filter(f => 
      f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.css')
    );

    const totalFiles = filesToAudit.length;
    const startIdx = batch * batchSize;
    const endIdx = Math.min(startIdx + batchSize, totalFiles);
    const batchFiles = filesToAudit.slice(startIdx, endIdx);

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
      results,
      batch,
      totalFiles,
      processedFiles: endIdx,
      hasMore: endIdx < totalFiles,
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