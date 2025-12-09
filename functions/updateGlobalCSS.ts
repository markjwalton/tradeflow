import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cssVariables } = await req.json();

    if (!cssVariables || typeof cssVariables !== 'object') {
      return Response.json({ error: 'Invalid cssVariables object' }, { status: 400 });
    }

    // Read current globals.css
    const globalsPath = '/src/globals.css';
    let currentCSS = await Deno.readTextFile(globalsPath);

    // Update CSS variables in :root
    Object.entries(cssVariables).forEach(([varName, value]) => {
      const regex = new RegExp(`(--${varName}:\\s*)([^;]+)(;)`, 'g');
      if (regex.test(currentCSS)) {
        currentCSS = currentCSS.replace(regex, `$1${value}$3`);
      } else {
        // Add new variable if it doesn't exist
        currentCSS = currentCSS.replace(
          /(:root\s*{[^}]*)/,
          `$1\n  --${varName}: ${value};`
        );
      }
    });

    // Write updated CSS back
    await Deno.writeTextFile(globalsPath, currentCSS);

    return Response.json({ 
      success: true,
      message: 'CSS variables updated successfully',
      updated: Object.keys(cssVariables).length
    });
  } catch (error) {
    console.error('Error updating globals.css:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});