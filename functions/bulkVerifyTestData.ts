import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testDataIds } = await req.json();
    
    if (!testDataIds || !Array.isArray(testDataIds) || testDataIds.length === 0) {
      return Response.json({ error: 'testDataIds array required' }, { status: 400 });
    }

    const results = {
      success: [],
      failed: []
    };

    // Process in service role to avoid rate limits on individual user
    for (const id of testDataIds) {
      try {
        await base44.asServiceRole.entities.TestData.update(id, {
          test_status: "verified",
          verified_date: new Date().toISOString()
        });
        results.success.push(id);
      } catch (e) {
        results.failed.push({ id, error: e.message });
      }
    }

    return Response.json({
      status: 'complete',
      verified: results.success.length,
      failed: results.failed.length,
      failedItems: results.failed
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});