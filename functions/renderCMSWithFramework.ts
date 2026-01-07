import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { websiteFolderId, frameworkPage } = await req.json();

    // Fetch the website folder and its CMS pages
    const [folder] = await base44.entities.WebsiteFolder.filter({ id: websiteFolderId });
    if (!folder) {
      return Response.json({ error: 'Website folder not found' }, { status: 404 });
    }

    const cmsPages = await base44.entities.CMSPage.filter({ 
      website_folder_id: websiteFolderId,
      status: 'published'
    });

    const cmsBlogPosts = await base44.entities.CMSBlogPost.filter({ 
      website_folder_id: websiteFolderId,
      status: 'published'
    });

    const cmsProducts = await base44.entities.CMSProduct.filter({ 
      website_folder_id: websiteFolderId,
      status: 'published'
    });

    // Get the framework page content (e.g., RadiantHome)
    const frameworkPagePath = `pages/${frameworkPage}.jsx`;
    
    // Use AI to analyze the framework and generate a rendering strategy
    const prompt = `You are a CMS rendering engine. Analyze this website framework and CMS content, then generate a JSON structure that maps the CMS content to the framework components.

FRAMEWORK PAGE: ${frameworkPage}
FRAMEWORK PATTERNS: Hero sections, Bento cards, Feature sections, Logo clouds, Screenshots

CMS CONTENT:
- Pages: ${JSON.stringify(cmsPages.map(p => ({ title: p.title, content: p.content, slug: p.slug })))}
- Blog Posts: ${JSON.stringify(cmsBlogPosts.map(p => ({ title: p.title, excerpt: p.excerpt, slug: p.slug })))}
- Products: ${JSON.stringify(cmsProducts.map(p => ({ name: p.name, description: p.description, price: p.price })))}

TASK: Generate a JSON structure that describes how to render this CMS content using the framework's component patterns. Map content to appropriate sections (Hero, Features, Bento grids, etc).

Return ONLY valid JSON with this structure:
{
  "hero": { "title": "...", "description": "...", "cta": "..." },
  "features": [{ "title": "...", "description": "...", "image": "..." }],
  "bentoCards": [{ "eyebrow": "...", "title": "...", "description": "..." }],
  "blogPosts": [{ "title": "...", "excerpt": "...", "slug": "..." }],
  "products": [{ "name": "...", "description": "...", "price": ... }]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          hero: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              cta: { type: "string" }
            }
          },
          features: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                image: { type: "string" }
              }
            }
          },
          bentoCards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                eyebrow: { type: "string" },
                title: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          blogPosts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                excerpt: { type: "string" },
                slug: { type: "string" }
              }
            }
          },
          products: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "number" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      renderData: result,
      metadata: {
        websiteName: folder.name,
        framework: frameworkPage,
        contentCounts: {
          pages: cmsPages.length,
          blogPosts: cmsBlogPosts.length,
          products: cmsProducts.length
        }
      }
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});