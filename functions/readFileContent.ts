import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filePath } = await req.json();

    if (!filePath) {
      return Response.json({ error: 'File path required' }, { status: 400 });
    }

    // Read the file from the project directory
    const projectRoot = Deno.cwd();
    
    // Try multiple possible paths
    const possiblePaths = [
      `${projectRoot}/src/${filePath}`,
      `${projectRoot}/${filePath}`,
      `${projectRoot}/app/src/${filePath}`,
    ];

    for (const fullPath of possiblePaths) {
      try {
        const content = await Deno.readTextFile(fullPath);
        return Response.json({ content, path: fullPath });
      } catch (error) {
        // Try next path
        continue;
      }
    }
    
    // If no path worked, return error
    return Response.json({ 
      error: 'File not found in any location',
      tried: possiblePaths,
      cwd: projectRoot
    }, { status: 404 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});