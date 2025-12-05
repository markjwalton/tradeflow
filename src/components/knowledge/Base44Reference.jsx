import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Copy, CheckCircle2, ExternalLink, Database,
  ChevronDown, ChevronRight 
} from "lucide-react";
import { toast } from "sonner";

const BASE44_SECTIONS = {
  entities: {
    name: "Entity Operations",
    description: "CRUD operations with base44 SDK",
    snippets: [
      {
        title: "List Entities",
        description: "Fetch all records with optional sorting",
        code: `import { base44 } from "@/api/base44Client";

// List all (default limit 50)
const items = await base44.entities.Item.list();

// With sorting (- for descending)
const items = await base44.entities.Item.list("-created_date", 50);

// Sort by field ascending
const items = await base44.entities.Item.list("name", 100);`
      },
      {
        title: "Filter Entities",
        description: "Query with conditions",
        code: `// Simple filter
const activeItems = await base44.entities.Item.filter({ 
  status: "active" 
});

// Multiple conditions
const myItems = await base44.entities.Item.filter({ 
  status: "active",
  created_by: user.email 
});

// With operators
const recentItems = await base44.entities.Item.filter({ 
  created_date: { $gte: "2025-01-01" }
});`
      },
      {
        title: "Create Entity",
        description: "Create a new record",
        code: `const newItem = await base44.entities.Item.create({
  name: "New Item",
  status: "active",
  priority: "high"
});

// Returns the created record with id`
      },
      {
        title: "Bulk Create",
        description: "Create multiple records at once",
        code: `await base44.entities.Item.bulkCreate([
  { name: "Item 1", status: "active" },
  { name: "Item 2", status: "pending" },
  { name: "Item 3", status: "active" }
]);`
      },
      {
        title: "Update Entity",
        description: "Update an existing record",
        code: `await base44.entities.Item.update(item.id, {
  status: "completed",
  completed_date: new Date().toISOString()
});`
      },
      {
        title: "Delete Entity",
        description: "Remove a record",
        code: `await base44.entities.Item.delete(item.id);`
      },
      {
        title: "Get Schema",
        description: "Retrieve entity JSON schema",
        code: `const schema = await base44.entities.Item.schema();
// Returns the JSON schema without built-in fields`
      }
    ]
  },
  auth: {
    name: "Authentication",
    description: "User authentication and management",
    snippets: [
      {
        title: "Get Current User",
        description: "Retrieve logged-in user details",
        code: `const user = await base44.auth.me();

// user contains:
// - id
// - email
// - full_name
// - role ('admin' or 'user')
// - created_date
// - any custom fields you added`
      },
      {
        title: "Check Authentication",
        description: "Verify if user is logged in",
        code: `const isLoggedIn = await base44.auth.isAuthenticated();

if (!isLoggedIn) {
  base44.auth.redirectToLogin();
}`
      },
      {
        title: "Update Current User",
        description: "Save data to the current user",
        code: `await base44.auth.updateMe({
  preferences: { theme: "dark" },
  onboarding_completed: true
});

// Cannot override built-in fields (id, email, full_name, role)`
      },
      {
        title: "Logout",
        description: "Log out the current user",
        code: `// Simple logout (reloads page)
base44.auth.logout();

// With redirect URL
base44.auth.logout("/login");`
      },
      {
        title: "Redirect to Login",
        description: "Send user to login page",
        code: `// Basic redirect
base44.auth.redirectToLogin();

// With return URL after login
base44.auth.redirectToLogin("/dashboard");`
      }
    ]
  },
  integrations: {
    name: "Integrations",
    description: "Built-in integration services",
    snippets: [
      {
        title: "Invoke LLM",
        description: "Generate AI responses",
        code: `const result = await base44.integrations.Core.InvokeLLM({
  prompt: "Summarize this text: " + longText,
  add_context_from_internet: false, // Set true for web search
  response_json_schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      key_points: { type: "array", items: { type: "string" } }
    }
  }
});

// result is already parsed JSON if schema provided`
      },
      {
        title: "Upload File",
        description: "Upload files to storage",
        code: `const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileObject // From input[type=file]
});

// file_url can be saved to entity or displayed`
      },
      {
        title: "Send Email",
        description: "Send email notifications",
        code: `await base44.integrations.Core.SendEmail({
  to: "user@example.com",
  subject: "Your Order Confirmation",
  body: "<h1>Thank you!</h1><p>Your order has been placed.</p>",
  from_name: "My App" // Optional
});`
      },
      {
        title: "Generate Image",
        description: "AI image generation",
        code: `const { url } = await base44.integrations.Core.GenerateImage({
  prompt: "A modern dashboard interface with charts and graphs"
});

// url contains the generated image`
      },
      {
        title: "Extract Data from File",
        description: "Parse uploaded files with AI",
        code: `// First upload the file
const { file_url } = await base44.integrations.Core.UploadFile({ file });

// Then extract structured data
const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
  file_url: file_url,
  json_schema: {
    type: "object",
    properties: {
      invoices: {
        type: "array",
        items: {
          type: "object",
          properties: {
            invoice_number: { type: "string" },
            amount: { type: "number" }
          }
        }
      }
    }
  }
});`
      }
    ]
  },
  functions: {
    name: "Backend Functions",
    description: "Calling custom backend functions",
    snippets: [
      {
        title: "Invoke Function",
        description: "Call a backend function",
        code: `import { base44 } from "@/api/base44Client";

const response = await base44.functions.invoke('myFunction', {
  param1: "value1",
  param2: 123
});

// response is Axios response object
// Access data with response.data`
      },
      {
        title: "Function with File Response",
        description: "Handle binary responses (PDFs, etc.)",
        code: `const response = await base44.functions.invoke('generatePdf', {
  reportId: "123"
});

// Create download link
const blob = new Blob([response.data], { type: 'application/pdf' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'report.pdf';
a.click();`
      }
    ]
  },
  agents: {
    name: "AI Agents",
    description: "Creating and using AI agents",
    snippets: [
      {
        title: "Create Conversation",
        description: "Start a new agent conversation",
        code: `const conversation = await base44.agents.createConversation({
  agent_name: "task_manager",
  metadata: {
    name: "My Conversation",
    description: "Task planning session"
  }
});`
      },
      {
        title: "Add Message",
        description: "Send a message to the agent",
        code: `await base44.agents.addMessage(conversation, {
  role: "user",
  content: "Create a new task for project review"
});

// With file attachments
await base44.agents.addMessage(conversation, {
  role: "user",
  content: "Analyze this document",
  file_urls: [fileUrl1, fileUrl2]
});`
      },
      {
        title: "Subscribe to Updates",
        description: "Real-time message streaming",
        code: `useEffect(() => {
  const unsubscribe = base44.agents.subscribeToConversation(
    conversationId, 
    (data) => {
      // Called for every streamed token
      setMessages(data.messages);
    }
  );

  return () => unsubscribe();
}, [conversationId]);`
      },
      {
        title: "WhatsApp Integration",
        description: "Connect agent to WhatsApp",
        code: `const whatsappUrl = base44.agents.getWhatsAppConnectURL('agent_name');

// Use in a link
<a href={whatsappUrl} target="_blank">
  Connect WhatsApp
</a>`
      }
    ]
  },
  patterns: {
    name: "Common Patterns",
    description: "Best practices and patterns",
    snippets: [
      {
        title: "React Query + Base44",
        description: "Data fetching with caching",
        code: `import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Fetch
const { data: items = [], isLoading } = useQuery({
  queryKey: ["items"],
  queryFn: () => base44.entities.Item.list("-created_date")
});

// Mutate with cache invalidation
const queryClient = useQueryClient();
const createMutation = useMutation({
  mutationFn: (data) => base44.entities.Item.create(data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] })
});`
      },
      {
        title: "Filter by Current User",
        description: "Show only user's own data",
        code: `const { data: user } = useQuery({
  queryKey: ["user"],
  queryFn: () => base44.auth.me()
});

const { data: myItems = [] } = useQuery({
  queryKey: ["items", "mine", user?.id],
  queryFn: () => base44.entities.Item.filter({ 
    created_by: user.email 
  }),
  enabled: !!user
});`
      },
      {
        title: "Optimistic Updates",
        description: "Instant UI feedback",
        code: `const updateMutation = useMutation({
  mutationFn: ({ id, data }) => base44.entities.Item.update(id, data),
  onMutate: async ({ id, data }) => {
    await queryClient.cancelQueries({ queryKey: ["items"] });
    const previous = queryClient.getQueryData(["items"]);
    queryClient.setQueryData(["items"], (old) =>
      old.map(item => item.id === id ? { ...item, ...data } : item)
    );
    return { previous };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(["items"], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  }
});`
      }
    ]
  }
};

export default function Base44Reference() {
  const [search, setSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState(new Set(["entities"]));
  const [copiedCode, setCopiedCode] = useState(null);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success("Copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            Base44 SDK Reference
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href="https://base44.com/docs" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Docs
            </a>
          </Button>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search SDK methods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {Object.entries(BASE44_SECTIONS).map(([key, section]) => {
              const isExpanded = expandedSections.has(key);
              
              const filteredSnippets = section.snippets.filter(s => 
                !search || 
                s.title.toLowerCase().includes(search.toLowerCase()) ||
                s.description?.toLowerCase().includes(search.toLowerCase()) ||
                s.code.toLowerCase().includes(search.toLowerCase())
              );

              if (filteredSnippets.length === 0) return null;

              return (
                <div key={key} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <span className="font-medium text-green-900">{section.name}</span>
                      <span className="text-sm text-green-600">{section.description}</span>
                    </div>
                    <Badge variant="outline">{filteredSnippets.length}</Badge>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white space-y-4">
                      {filteredSnippets.map((snippet, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-green-800">{snippet.title}</h4>
                              <p className="text-xs text-gray-600">{snippet.description}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyCode(snippet.code, `${key}-${idx}`)}
                            >
                              {copiedCode === `${key}-${idx}` ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            {snippet.code}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}