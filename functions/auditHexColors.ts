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
      const allFiles = [];
      
      // Recursively get all files from a directory
      const getAllFilesRecursive = async (path, prefix = '') => {
        try {
          const response = await base44.asServiceRole.functions.invoke('readFileContent', { 
            file_path: path 
          });
          
          if (response.data?.files) {
            for (const file of response.data.files) {
              const fullPath = prefix ? `${prefix}/${file}` : file;
              
              // If it's a directory, recurse into it
              if (!file.includes('.')) {
                await getAllFilesRecursive(`${path}/${file}`, fullPath);
              } else {
                allFiles.push(fullPath);
              }
            }
          }
          
          if (response.data?.directories) {
            for (const dir of response.data.directories) {
              const fullPath = prefix ? `${prefix}/${dir}` : dir;
              await getAllFilesRecursive(`${path}/${dir}`, fullPath);
            }
          }
        } catch (e) {
          console.log(`Could not list ${path}:`, e.message);
        }
      };
      
      await getAllFilesRecursive('pages', 'pages');
      await getAllFilesRecursive('components', 'components');
      
      allFiles.push('Layout.js', 'globals.css');

      const filesToAudit = allFiles.filter(f => 
        f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.css')
      );

      return Response.json({ 
        success: true,
        files: filesToAudit,
        total: filesToAudit.length
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