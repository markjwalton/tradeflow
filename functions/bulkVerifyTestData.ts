import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

    const verifiedDate = new Date().toISOString();

    // Process with delays to avoid rate limits - 1 update per 500ms
    for (let i = 0; i < testDataIds.length; i++) {
      const id = testDataIds[i];
      try {
        await base44.asServiceRole.entities.TestData.update(id, {
          test_status: "verified",
          verified_date: verifiedDate
        });
        results.success.push(id);
      } catch (e) {
        // If rate limited, wait longer and retry once
        if (e.message?.includes('Rate limit') || e.message?.includes('rate limit')) {
          await sleep(2000);
          try {
            await base44.asServiceRole.entities.TestData.update(id, {
              test_status: "verified",
              verified_date: verifiedDate
            });
            results.success.push(id);
          } catch (retryError) {
            results.failed.push({ id, error: retryError.message });
          }
        } else {
          results.failed.push({ id, error: e.message });
        }
      }
      
      // Delay after each update
      if (i < testDataIds.length - 1) {
        await sleep(300);
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