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
    const fullPath = `${projectRoot}/src/${filePath}`;

    try {
      const content = await Deno.readTextFile(fullPath);
      return Response.json({ content });
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return Response.json({ error: 'File not found' }, { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});