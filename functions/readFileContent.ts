import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { filePath } = await req.json();
    
    if (!filePath) {
      return Response.json({ success: false, error: 'filePath required' }, { status: 400 });
    }

    // Security: restrict to specific directories
    const allowedPaths = ['pages/', 'components/', 'Layout.js', 'globals.css'];
    const isAllowed = allowedPaths.some(allowed => 
      filePath === allowed || filePath.startsWith(allowed)
    );
    
    if (!isAllowed) {
      return Response.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const content = await Deno.readTextFile(filePath);
    
    return Response.json({ success: true, content });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});