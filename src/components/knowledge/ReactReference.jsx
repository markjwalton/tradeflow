import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, ExternalLink, Copy, CheckCircle2, Component,
  ChevronDown, ChevronRight 
} from "lucide-react";
import { toast } from "sonner";

// Comprehensive React patterns and snippets
const REACT_SECTIONS = {
  data_fetching: {
    name: "Data Fetching (React Query)",
    description: "Using @tanstack/react-query with base44",
    snippets: [
      {
        title: "Basic List Query",
        description: "Fetch a list of entities",
        code: `import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const { data: items = [], isLoading, error } = useQuery({
  queryKey: ["items"],
  queryFn: () => base44.entities.Item.list("-created_date", 50)
});

// Usage
if (isLoading) return <Loader2 className="animate-spin" />;
if (error) return <p>Error: {error.message}</p>;`
      },
      {
        title: "Filtered Query",
        description: "Fetch entities with filters",
        code: `const { data: activeItems = [] } = useQuery({
  queryKey: ["items", "active", userId],
  queryFn: () => base44.entities.Item.filter({ 
    status: "active",
    owner_id: userId 
  })
});`
      },
      {
        title: "Create Mutation",
        description: "Create new entity with cache invalidation",
        code: `import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const createMutation = useMutation({
  mutationFn: (data) => base44.entities.Item.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
    toast.success("Created successfully!");
  },
  onError: (error) => {
    toast.error("Failed: " + error.message);
  }
});

// Usage
const handleCreate = () => {
  createMutation.mutate({ name: "New Item", status: "active" });
};`
      },
      {
        title: "Update Mutation",
        description: "Update existing entity",
        code: `const updateMutation = useMutation({
  mutationFn: ({ id, data }) => base44.entities.Item.update(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
    toast.success("Updated!");
  }
});

// Usage
updateMutation.mutate({ 
  id: item.id, 
  data: { status: "completed" } 
});`
      },
      {
        title: "Delete Mutation",
        description: "Delete entity",
        code: `const deleteMutation = useMutation({
  mutationFn: (id) => base44.entities.Item.delete(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
    toast.success("Deleted");
  }
});`
      },
      {
        title: "Dependent Queries",
        description: "Query that depends on another query",
        code: `// First query
const { data: user } = useQuery({
  queryKey: ["user"],
  queryFn: () => base44.auth.me()
});

// Dependent query - only runs when user is available
const { data: userProjects = [] } = useQuery({
  queryKey: ["projects", user?.id],
  queryFn: () => base44.entities.Project.filter({ owner_id: user.id }),
  enabled: !!user?.id // Only run when user.id exists
});`
      }
    ]
  },
  component_patterns: {
    name: "Component Patterns",
    description: "Common React component structures",
    snippets: [
      {
        title: "Page Component Template",
        description: "Standard page structure",
        code: `import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function MyPage() {
  const [filter, setFilter] = useState("all");
  
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items", filter],
    queryFn: () => base44.entities.Item.list()
  });

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading text-[var(--color-midnight)]">
            Page Title
          </h1>
          <p className="text-[var(--color-charcoal)]">
            Page description
          </p>
        </div>
        <Button className="bg-[var(--color-primary)]">
          Action
        </Button>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-4">
              {item.name}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}`
      },
      {
        title: "Reusable Component",
        description: "Small focused component",
        code: `import React from "react";
import { Badge } from "@/components/ui/badge";

export default function StatusBadge({ status }) {
  const config = {
    active: { label: "Active", className: "bg-[var(--color-success)]/20 text-[var(--color-success)]" },
    pending: { label: "Pending", className: "bg-[var(--color-warning)]/20 text-[var(--color-warning)]" },
    inactive: { label: "Inactive", className: "bg-gray-100 text-gray-600" }
  };

  const { label, className } = config[status] || config.inactive;

  return <Badge className={className}>{label}</Badge>;
}`
      },
      {
        title: "Form Component",
        description: "Form with controlled inputs",
        code: `import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ItemForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    description: ""
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[var(--color-primary)]">
          Save
        </Button>
      </div>
    </form>
  );
}`
      }
    ]
  },
  hooks: {
    name: "React Hooks",
    description: "Common hooks and patterns",
    snippets: [
      {
        title: "useState",
        description: "Managing component state",
        code: `// Basic state
const [value, setValue] = useState("");

// Object state
const [form, setForm] = useState({ name: "", email: "" });
const handleChange = (field, value) => {
  setForm(prev => ({ ...prev, [field]: value }));
};

// Array state
const [items, setItems] = useState([]);
const addItem = (item) => setItems(prev => [...prev, item]);
const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

// Toggle state
const [isOpen, setIsOpen] = useState(false);
const toggle = () => setIsOpen(prev => !prev);`
      },
      {
        title: "useEffect",
        description: "Side effects (use sparingly - prefer React Query for data)",
        code: `// Run once on mount
useEffect(() => {
  document.title = "My Page";
}, []);

// Run when dependency changes
useEffect(() => {
  if (selectedId) {
    // Do something when selectedId changes
  }
}, [selectedId]);

// Cleanup
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}, []);`
      },
      {
        title: "useMemo & useCallback",
        description: "Performance optimization",
        code: `// Memoize expensive computation
const filteredItems = useMemo(() => {
  return items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );
}, [items, search]);

// Memoize callback function
const handleClick = useCallback((id) => {
  setSelectedId(id);
}, []);`
      },
      {
        title: "Custom Hook",
        description: "Reusable logic extraction",
        code: `// hooks/useLocalStorage.js
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Usage
const [settings, setSettings] = useLocalStorage("settings", { theme: "light" });`
      }
    ]
  },
  navigation: {
    name: "Navigation & Routing",
    description: "React Router and navigation patterns",
    snippets: [
      {
        title: "URL Parameters",
        description: "Reading URL query parameters",
        code: `// Read URL parameters
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tab = urlParams.get("tab") || "overview";`
      },
      {
        title: "Navigation",
        description: "Programmatic navigation",
        code: `import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Hook for programmatic navigation
const navigate = useNavigate();

// Navigate to page
const goToDetails = (id) => {
  navigate(createPageUrl("Details?id=" + id));
};

// Link component
<Link to={createPageUrl("Dashboard")}>
  Go to Dashboard
</Link>

// With query params
<Link to={createPageUrl("Projects?status=active&sort=-created_date")}>
  Active Projects
</Link>`
      }
    ]
  },
  utilities: {
    name: "Common Utilities",
    description: "Frequently used utility patterns",
    snippets: [
      {
        title: "Toast Notifications",
        description: "Using sonner for toasts",
        code: `import { toast } from "sonner";

// Success
toast.success("Saved successfully!");

// Error
toast.error("Something went wrong: " + error.message);

// Info
toast.info("Processing your request...");

// Warning
toast.warning("This action cannot be undone");

// With action
toast("Item deleted", {
  action: {
    label: "Undo",
    onClick: () => handleUndo()
  }
});`
      },
      {
        title: "Date Formatting",
        description: "Using date-fns",
        code: `import { format, formatDistanceToNow, isAfter, addDays } from "date-fns";

// Format date
format(new Date(), "MMMM d, yyyy") // "January 15, 2025"
format(new Date(), "MMM d") // "Jan 15"
format(new Date(), "yyyy-MM-dd") // "2025-01-15"

// Relative time
formatDistanceToNow(new Date(item.created_date), { addSuffix: true })
// "3 days ago"

// Comparisons
const isOverdue = isAfter(new Date(), new Date(item.due_date));
const nextWeek = addDays(new Date(), 7);`
      },
      {
        title: "Current User",
        description: "Getting authenticated user",
        code: `import { base44 } from "@/api/base44Client";

// In an async function
const user = await base44.auth.me();
console.log(user.email, user.full_name, user.role);

// With React Query
const { data: user } = useQuery({
  queryKey: ["currentUser"],
  queryFn: () => base44.auth.me()
});`
      },
      {
        title: "Conditional Classes",
        description: "Dynamic className patterns",
        code: `// Using template literals
<div className={\`p-4 rounded-lg \${isActive ? "bg-green-100" : "bg-gray-100"}\`}>

// Using cn (clsx/tailwind-merge)
import { cn } from "@/lib/utils";

<div className={cn(
  "p-4 rounded-lg",
  isActive && "bg-green-100 border-green-300",
  isError && "bg-red-100 border-red-300",
  className
)}>

// Array join pattern
<div className={[
  "p-4 rounded-lg",
  isActive ? "bg-green-100" : "bg-gray-100"
].join(" ")}>`
      }
    ]
  },
  integrations: {
    name: "Base44 Integrations",
    description: "Using built-in integrations",
    snippets: [
      {
        title: "Upload File",
        description: "Upload files to storage",
        code: `const handleFileUpload = async (file) => {
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  // Use file_url to save to entity
  return file_url;
};

// Usage with input
<input 
  type="file" 
  onChange={(e) => handleFileUpload(e.target.files[0])} 
/>`
      },
      {
        title: "AI / LLM",
        description: "Invoke AI for text generation",
        code: `const result = await base44.integrations.Core.InvokeLLM({
  prompt: "Summarize this text: " + longText,
  response_json_schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      keyPoints: { type: "array", items: { type: "string" } }
    }
  }
});

console.log(result.summary);`
      },
      {
        title: "Send Email",
        description: "Send email notifications",
        code: `await base44.integrations.Core.SendEmail({
  to: user.email,
  subject: "Your order confirmation",
  body: "<h1>Order Confirmed</h1><p>Thank you for your order!</p>"
});`
      }
    ]
  }
};

export default function ReactReference() {
  const [search, setSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState(new Set(["data_fetching"]));
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
            <Component className="h-5 w-5 text-blue-600" />
            React Patterns & Snippets
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              React Docs
            </a>
          </Button>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patterns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {Object.entries(REACT_SECTIONS).map(([key, section]) => {
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
                    className="w-full px-4 py-3 flex items-center justify-between bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <span className="font-medium text-blue-900">{section.name}</span>
                      <span className="text-sm text-blue-600">{section.description}</span>
                    </div>
                    <Badge variant="outline">{filteredSnippets.length}</Badge>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white space-y-4">
                      {filteredSnippets.map((snippet, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-blue-800">{snippet.title}</h4>
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