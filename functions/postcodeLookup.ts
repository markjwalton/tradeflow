import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postcode } = await req.json();
    
    if (!postcode) {
      return Response.json({ error: 'Postcode is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get("IDEAL_POSTCODES_API_KEY");
    
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const cleanPostcode = postcode.replace(/\s/g, "").toUpperCase();
    const response = await fetch(
      `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(cleanPostcode)}?api_key=${apiKey}`
    );
    
    const data = await response.json();
    
    // Transform the response for easier use
    if (data.result && Array.isArray(data.result)) {
      const addresses = data.result.map((addr) => ({
        formatted: [
          addr.building_number || addr.building_name,
          addr.thoroughfare || addr.line_1,
          addr.post_town,
          addr.postcode,
        ].filter(Boolean).join(', '),
        building_number: addr.building_number || '',
        building_name: addr.building_name || '',
        thoroughfare: addr.thoroughfare || '',
        line_1: addr.line_1 || '',
        line_2: addr.line_2 || '',
        town_or_city: addr.post_town || '',
        county: addr.county || '',
        postcode: addr.postcode || '',
      }));
      return Response.json({ addresses });
    }
    
    return Response.json({ addresses: [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});