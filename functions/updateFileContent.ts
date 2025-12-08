import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filePath, newContent } = await req.json();

    if (!filePath || newContent === undefined) {
      return Response.json({ error: 'filePath and newContent required' }, { status: 400 });
    }

    // Security: Only allow specific file paths
    const allowed = filePath.startsWith('pages/') || 
                    filePath.startsWith('components/') || 
                    filePath === 'Layout.js' || 
                    filePath === 'globals.css';
    
    if (!allowed) {
      return Response.json({ error: 'Access denied to file path' }, { status: 403 });
    }

    await Deno.writeTextFile(filePath, newContent);

    return Response.json({ 
      success: true, 
      message: `Updated ${filePath}` 
    });
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});