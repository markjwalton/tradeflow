import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { versionId1, versionId2 } = await req.json();

    if (!versionId1 || !versionId2) {
      return Response.json({ error: 'Missing version IDs' }, { status: 400 });
    }

    const [version1, version2] = await Promise.all([
      base44.asServiceRole.entities.ContentVersion.filter({ id: versionId1 }),
      base44.asServiceRole.entities.ContentVersion.filter({ id: versionId2 }),
    ]);

    if (version1.length === 0 || version2.length === 0) {
      return Response.json({ error: 'Version not found' }, { status: 404 });
    }

    const snapshot1 = JSON.parse(version1[0].content_snapshot);
    const snapshot2 = JSON.parse(version2[0].content_snapshot);

    const differences = {};
    const allKeys = new Set([...Object.keys(snapshot1), ...Object.keys(snapshot2)]);

    allKeys.forEach(key => {
      const val1 = snapshot1[key];
      const val2 = snapshot2[key];
      
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        differences[key] = {
          before: val1,
          after: val2,
          changed: true,
        };
      }
    });

    return Response.json({
      success: true,
      version1: {
        id: version1[0].id,
        number: version1[0].version_number,
        date: version1[0].created_date,
      },
      version2: {
        id: version2[0].id,
        number: version2[0].version_number,
        date: version2[0].created_date,
      },
      differences,
      totalChanges: Object.keys(differences).length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});