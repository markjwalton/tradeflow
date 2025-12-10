import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Fetch session
    const sessions = await base44.asServiceRole.entities.OnboardingSession.filter({ id: sessionId });
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    const session = sessions[0];

    // Create test tenant profile
    const profile = await base44.asServiceRole.entities.TenantProfile.create({
      tenant_id: session.tenant_id,
      company_name: "Artisan Crafts Ltd",
      website: "https://artisancrafts.example.com",
      email: "contact@artisancrafts.com",
      phone: "+44 20 1234 5678",
      address: {
        line1: "123 Maker Street",
        city: "London",
        postcode: "E1 6AN",
        country: "United Kingdom"
      },
      business_summary: "A boutique e-commerce platform selling handmade artisan crafts from local creators",
      app_goals: ["Streamline order processing", "Improve inventory tracking", "Enhance customer experience"],
      kpis: [
        { name: "Order fulfillment time", target: "24h", metric: "hours" },
        { name: "Customer satisfaction", target: "4.5/5", metric: "rating" },
        { name: "Inventory accuracy", target: "98%", metric: "percentage" }
      ]
    });

    // Create business profile
    const business = await base44.asServiceRole.entities.BusinessProfile.create({
      onboarding_session_id: sessionId,
      industry: "Retail & E-commerce",
      business_size: "small_2_10",
      market_type: "B2C",
      primary_problem: "Manual order processing causing delays and inventory discrepancies",
      current_tools: ["Excel spreadsheets", "Email", "WhatsApp"],
      growth_goals: "Double sales within 12 months while maintaining quality"
    });

    // Create operational processes
    const processes = await base44.asServiceRole.entities.OperationalProcess.bulkCreate([
      {
        onboarding_session_id: sessionId,
        process_name: "Order Management",
        process_type: "sales_crm",
        priority: 1,
        current_workflow: "Customer emails order, manually entered into spreadsheet, payment confirmed via bank transfer, order fulfillment tracked on paper",
        pain_points: ["Lost orders", "Double-entry errors", "No real-time tracking", "Manual inventory updates"],
        desired_outcomes: ["Automated order capture", "Real-time inventory sync", "Customer order tracking portal"],
        monthly_volume: 150,
        automation_opportunities: "Online order form, automated inventory updates, customer notifications"
      },
      {
        onboarding_session_id: sessionId,
        process_name: "Inventory Management",
        process_type: "inventory_supply_chain",
        priority: 2,
        current_workflow: "Stock tracked in Excel, manually updated after sales, physical counts weekly",
        pain_points: ["Out-of-stock surprises", "Over-ordering", "No low-stock alerts"],
        desired_outcomes: ["Real-time stock visibility", "Automated reorder alerts", "Supplier integration"],
        monthly_volume: 300,
        automation_opportunities: "Barcode scanning, automatic stock adjustments, reorder notifications"
      }
    ]);

    // Create requirements
    const requirements = await base44.asServiceRole.entities.Requirement.bulkCreate([
      {
        onboarding_session_id: sessionId,
        requirement_type: "functional",
        title: "Product Catalog Management",
        description: "Admin interface to add, edit, and manage product listings with images and pricing",
        priority: "must_have",
        user_story: "As a shop owner, I want to easily manage my product catalog so that I can keep listings up-to-date"
      },
      {
        onboarding_session_id: sessionId,
        requirement_type: "functional",
        title: "Online Order Processing",
        description: "Customer-facing order form with payment integration",
        priority: "must_have",
        user_story: "As a customer, I want to place orders online so that I can shop conveniently"
      },
      {
        onboarding_session_id: sessionId,
        requirement_type: "integration",
        title: "Payment Gateway",
        description: "Integration with Stripe for secure payment processing",
        priority: "must_have",
        user_story: "As a shop owner, I want secure payment processing so that I can receive payments safely"
      }
    ]);

    return Response.json({
      success: true,
      data: {
        profile,
        business,
        processes: processes.length,
        requirements: requirements.length
      }
    });

  } catch (error) {
    console.error("Create test data error:", error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});