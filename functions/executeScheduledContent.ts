import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date().toISOString();
    
    const pendingSchedules = await base44.asServiceRole.entities.ContentSchedule.filter({
      status: 'pending',
      scheduled_date: { $lte: now }
    });

    const entityMap = {
      page: 'CMSPage',
      blog: 'CMSBlogPost',
      product: 'CMSProduct',
      section: 'CMSSection',
    };

    const results = {
      processed: 0,
      failed: 0,
      errors: [],
    };

    for (const schedule of pendingSchedules) {
      try {
        const entityName = entityMap[schedule.content_type];
        const content = await base44.asServiceRole.entities[entityName].filter({ 
          id: schedule.content_id 
        });

        if (content.length === 0) {
          throw new Error('Content not found');
        }

        if (schedule.action === 'publish') {
          await base44.asServiceRole.entities[entityName].update(schedule.content_id, {
            status: 'published',
            publish_date: now,
          });
        } else if (schedule.action === 'unpublish') {
          await base44.asServiceRole.entities[entityName].update(schedule.content_id, {
            status: 'draft',
          });
        } else if (schedule.action === 'archive') {
          await base44.asServiceRole.entities[entityName].update(schedule.content_id, {
            status: 'archived',
          });
        }

        await base44.asServiceRole.entities.ContentSchedule.update(schedule.id, {
          status: 'executed',
          executed_date: now,
        });

        results.processed++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          scheduleId: schedule.id,
          error: error.message,
        });

        await base44.asServiceRole.entities.ContentSchedule.update(schedule.id, {
          status: 'failed',
          notes: error.message,
        });
      }
    }

    return Response.json({
      success: true,
      results,
      message: `Processed ${results.processed} schedules, ${results.failed} failed`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});