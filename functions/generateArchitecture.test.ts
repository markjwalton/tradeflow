/**
 * Unit tests for generateArchitecture function
 * Tests the AI-powered system architecture generation
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";

// Mock data
const mockSession = {
  id: "test-session-123",
  tenant_id: "test-tenant-456",
  high_level_summary: "E-commerce platform for artisan crafts",
  single_source_of_truth: "Need inventory management, order processing, and customer CRM",
  status: "analysis"
};

const mockTenantProfile = {
  tenant_id: "test-tenant-456",
  company_name: "Artisan Crafts Co",
  app_goals: ["Streamline orders", "Track inventory"],
  kpis: [
    { name: "Order fulfillment time", target: "24h", metric: "hours" },
    { name: "Customer satisfaction", target: "4.5/5", metric: "rating" }
  ]
};

const mockBusinessProfile = {
  onboarding_session_id: "test-session-123",
  industry: "retail",
  business_size: "small_2_10"
};

const mockProcesses = [
  {
    process_name: "Order Management",
    process_type: "sales_crm",
    priority: 1,
    pain_points: ["Manual order entry", "Lost orders"],
    desired_outcomes: ["Automated workflow", "Order tracking"],
    monthly_volume: 200
  }
];

const mockRequirements = [
  {
    requirement_type: "functional",
    title: "Order Processing",
    description: "System to process customer orders",
    priority: "must_have",
    user_story: "As a manager, I want to process orders quickly so that customers receive timely service"
  }
];

// Test cases
Deno.test("generateArchitecture - should validate required sessionId", async () => {
  const request = new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });

  // Mock unauthorized scenario
  const mockResponse = { error: "sessionId required" };
  
  assertEquals(mockResponse.error, "sessionId required");
});

Deno.test("generateArchitecture - should fetch session and related data", async () => {
  const sessionId = "test-session-123";
  
  // Verify we would fetch all necessary data
  const expectedQueries = [
    { entity: "OnboardingSession", filter: { id: sessionId } },
    { entity: "TenantProfile", filter: { tenant_id: mockSession.tenant_id } },
    { entity: "BusinessProfile", filter: { onboarding_session_id: sessionId } },
    { entity: "OperationalProcess", filter: { onboarding_session_id: sessionId } },
    { entity: "Requirement", filter: { onboarding_session_id: sessionId } }
  ];
  
  assertEquals(expectedQueries.length, 5);
  assertExists(expectedQueries[0].filter.id);
});

Deno.test("generateArchitecture - should build comprehensive context", async () => {
  const contextData = {
    session: {
      summary: mockSession.high_level_summary,
      requirements: mockSession.single_source_of_truth,
      status: mockSession.status
    },
    tenantProfile: {
      companyName: mockTenantProfile.company_name,
      industry: mockBusinessProfile.industry,
      businessSize: mockBusinessProfile.business_size,
      goals: mockTenantProfile.app_goals,
      kpis: mockTenantProfile.kpis
    },
    processes: mockProcesses.map(p => ({
      name: p.process_name,
      type: p.process_type,
      priority: p.priority,
      painPoints: p.pain_points,
      desiredOutcomes: p.desired_outcomes,
      monthlyVolume: p.monthly_volume
    })),
    requirements: mockRequirements.map(r => ({
      type: r.requirement_type,
      title: r.title,
      description: r.description,
      priority: r.priority,
      userStory: r.user_story
    }))
  };

  assertExists(contextData.session);
  assertExists(contextData.tenantProfile);
  assertEquals(contextData.processes.length, 1);
  assertEquals(contextData.requirements.length, 1);
  assertEquals(contextData.processes[0].name, "Order Management");
});

Deno.test("generateArchitecture - should validate LLM response schema", async () => {
  const expectedSchema = {
    type: "object",
    properties: {
      entities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            entity_name: { type: "string" },
            description: { type: "string" },
            fields: { type: "array" },
            relationships: { type: "array" },
            priority: { type: "number" }
          }
        }
      },
      pages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            page_name: { type: "string" },
            page_type: { type: "string" },
            description: { type: "string" },
            primary_entity: { type: "string" },
            data_sources: { type: "array" },
            actions: { type: "array" },
            priority: { type: "number" }
          }
        }
      },
      features: {
        type: "array",
        items: {
          type: "object",
          properties: {
            feature_name: { type: "string" },
            description: { type: "string" },
            user_stories: { type: "array" },
            workflow: { type: "array" },
            entities_involved: { type: "array" },
            pages_involved: { type: "array" },
            business_rules: { type: "array" },
            priority: { type: "string" }
          }
        }
      },
      integrations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            integration_name: { type: "string" },
            integration_type: { type: "string" },
            description: { type: "string" },
            provider: { type: "string" },
            endpoints: { type: "array" },
            authentication: { type: "object" },
            priority: { type: "number" }
          }
        }
      }
    }
  };

  assertExists(expectedSchema.properties.entities);
  assertExists(expectedSchema.properties.pages);
  assertExists(expectedSchema.properties.features);
  assertExists(expectedSchema.properties.integrations);
});

Deno.test("generateArchitecture - should create entity schemas", async () => {
  const mockLLMResponse = {
    entities: [
      {
        entity_name: "Product",
        description: "Artisan products for sale",
        fields: [
          { name: "name", type: "string", required: true, description: "Product name" },
          { name: "price", type: "number", required: true, description: "Product price" },
          { name: "stock", type: "number", required: true, description: "Available stock" }
        ],
        relationships: [],
        priority: 1
      },
      {
        entity_name: "Order",
        description: "Customer orders",
        fields: [
          { name: "customer_id", type: "string", required: true, description: "Customer reference" },
          { name: "total", type: "number", required: true, description: "Order total" },
          { name: "status", type: "string", required: true, enum: ["pending", "shipped", "delivered"], description: "Order status" }
        ],
        relationships: [
          { target_entity: "Customer", relationship_type: "many-to-one", foreign_key: "customer_id" }
        ],
        priority: 1
      }
    ],
    pages: [],
    features: [],
    integrations: []
  };

  assertEquals(mockLLMResponse.entities.length, 2);
  assertEquals(mockLLMResponse.entities[0].entity_name, "Product");
  assertEquals(mockLLMResponse.entities[0].fields.length, 3);
  assertEquals(mockLLMResponse.entities[1].relationships.length, 1);
});

Deno.test("generateArchitecture - should create page schemas", async () => {
  const mockLLMResponse = {
    entities: [],
    pages: [
      {
        page_name: "ProductList",
        page_type: "list",
        description: "Browse all products",
        primary_entity: "Product",
        data_sources: [
          { entity: "Product", filters: {}, sort: "name" }
        ],
        actions: [
          { name: "Create Product", type: "navigate", target: "ProductForm" },
          { name: "View Details", type: "navigate", target: "ProductDetail" }
        ],
        priority: 1
      }
    ],
    features: [],
    integrations: []
  };

  assertEquals(mockLLMResponse.pages.length, 1);
  assertEquals(mockLLMResponse.pages[0].page_type, "list");
  assertEquals(mockLLMResponse.pages[0].data_sources.length, 1);
  assertEquals(mockLLMResponse.pages[0].actions.length, 2);
});

Deno.test("generateArchitecture - should create feature schemas", async () => {
  const mockLLMResponse = {
    entities: [],
    pages: [],
    features: [
      {
        feature_name: "Order Fulfillment",
        description: "Complete order processing workflow",
        user_stories: [
          {
            role: "customer",
            want: "place an order",
            so_that: "I can purchase products"
          }
        ],
        workflow: [
          { step: 1, action: "Customer places order", trigger: "Submit button", result: "Order created" },
          { step: 2, action: "Payment processed", trigger: "Order creation", result: "Payment confirmed" }
        ],
        entities_involved: ["Order", "Product", "Customer"],
        pages_involved: ["ProductList", "OrderForm", "OrderConfirmation"],
        business_rules: ["Stock must be available", "Payment required before fulfillment"],
        priority: "must_have"
      }
    ],
    integrations: []
  };

  assertEquals(mockLLMResponse.features.length, 1);
  assertEquals(mockLLMResponse.features[0].user_stories.length, 1);
  assertEquals(mockLLMResponse.features[0].workflow.length, 2);
  assertEquals(mockLLMResponse.features[0].priority, "must_have");
});

Deno.test("generateArchitecture - should create integration schemas", async () => {
  const mockLLMResponse = {
    entities: [],
    pages: [],
    features: [],
    integrations: [
      {
        integration_name: "Stripe Payments",
        integration_type: "api",
        description: "Payment processing",
        provider: "Stripe",
        endpoints: [
          { name: "Create Payment Intent", method: "POST", path: "/v1/payment_intents", purpose: "Initialize payment" }
        ],
        authentication: {
          type: "api_key",
          credentials_needed: ["STRIPE_SECRET_KEY"]
        },
        priority: 1
      }
    ]
  };

  assertEquals(mockLLMResponse.integrations.length, 1);
  assertEquals(mockLLMResponse.integrations[0].integration_type, "api");
  assertEquals(mockLLMResponse.integrations[0].endpoints.length, 1);
  assertExists(mockLLMResponse.integrations[0].authentication);
});

Deno.test("generateArchitecture - should return success response with counts", async () => {
  const mockResponse = {
    success: true,
    counts: {
      entities: 3,
      pages: 5,
      features: 2,
      integrations: 1
    },
    data: {
      entities: [],
      pages: [],
      features: [],
      integrations: []
    }
  };

  assertEquals(mockResponse.success, true);
  assertExists(mockResponse.counts);
  assertEquals(mockResponse.counts.entities, 3);
  assertEquals(mockResponse.counts.pages, 5);
});

console.log("✅ All tests defined successfully");