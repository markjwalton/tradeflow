import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const filePath = payload.file_path || payload.filePath;

    if (!filePath) {
      return Response.json({ error: 'File path required' }, { status: 400 });
    }

    // List all directories to debug
    const rootEntries = [];
    try {
      for await (const entry of Deno.readDir('/')) {
        rootEntries.push(entry.name);
      }
    } catch {}

    const srcEntries = [];
    try {
      for await (const entry of Deno.readDir('/src')) {
        srcEntries.push(entry.name);
      }
    } catch {}

    return Response.json({ 
      error: 'Debug info',
      rootEntries,
      srcEntries,
      requestedFile: filePath
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});