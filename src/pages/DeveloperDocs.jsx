import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, 
  Code2, 
  Palette, 
  Database, 
  Shield, 
  Rocket, 
  GitBranch, 
  TestTube,
  FileCode,
  Accessibility,
  Zap,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '@/components/sturij';

const guides = [
  // Core Development
  {
    title: 'Component Architecture',
    file: 'COMPONENT_ARCHITECTURE_GUIDE.md',
    description: 'Component patterns, composition, and best practices',
    category: 'Core',
    icon: Code2,
    tags: ['components', 'patterns', 'architecture'],
  },
  {
    title: 'React Hooks',
    file: 'REACT_HOOKS_GUIDE.md',
    description: 'Complete guide to built-in and custom React hooks',
    category: 'Core',
    icon: Code2,
    tags: ['react', 'hooks', 'state'],
  },
  {
    title: 'TypeScript',
    file: 'TYPESCRIPT_GUIDE.md',
    description: 'Type-safe development with TypeScript',
    category: 'Core',
    icon: FileCode,
    tags: ['typescript', 'types', 'safety'],
  },
  {
    title: 'API Integration',
    file: 'API_INTEGRATION_GUIDE.md',
    description: 'Base44 SDK, React Query, error handling, and caching',
    category: 'Core',
    icon: Database,
    tags: ['api', 'sdk', 'react-query'],
  },
  {
    title: 'State Management',
    file: 'STATE_MANAGEMENT_GUIDE.md',
    description: 'Local, global, context, and URL state patterns',
    category: 'Core',
    icon: Database,
    tags: ['state', 'context', 'zustand'],
  },

  // UI & Styling
  {
    title: 'Styling & Theming',
    file: 'STYLING_THEMING_GUIDE.md',
    description: 'Tailwind CSS, design tokens, and theming system',
    category: 'UI',
    icon: Palette,
    tags: ['css', 'tailwind', 'theming'],
  },
  {
    title: 'Routing & Navigation',
    file: 'ROUTING_NAVIGATION_GUIDE.md',
    description: 'Page routing, URL state, and navigation patterns',
    category: 'UI',
    icon: Code2,
    tags: ['routing', 'navigation', 'urls'],
  },
  {
    title: 'Accessibility',
    file: 'ACCESSIBILITY_GUIDE.md',
    description: 'WCAG 2.1 standards and accessible components',
    category: 'UI',
    icon: Accessibility,
    tags: ['a11y', 'wcag', 'accessibility'],
  },
  {
    title: 'UX Patterns',
    file: 'UX_PATTERNS_GUIDE.md',
    description: 'Common UX patterns and implementations',
    category: 'UI',
    icon: Palette,
    tags: ['ux', 'patterns', 'design'],
  },

  // Quality & Testing
  {
    title: 'Testing',
    file: 'TESTING_GUIDE.md',
    description: 'Unit, integration, and E2E testing strategies',
    category: 'Quality',
    icon: TestTube,
    tags: ['testing', 'vitest', 'playwright'],
  },
  {
    title: 'Code Style',
    file: 'CODE_STYLE_GUIDE.md',
    description: 'Coding standards and conventions',
    category: 'Quality',
    icon: FileCode,
    tags: ['style', 'eslint', 'prettier'],
  },
  {
    title: 'Form Validation',
    file: 'FORM_VALIDATION_GUIDE.md',
    description: 'Form validation patterns and best practices',
    category: 'Quality',
    icon: Code2,
    tags: ['forms', 'validation', 'zod'],
  },

  // Security & Performance
  {
    title: 'Security',
    file: 'SECURITY_GUIDE.md',
    description: 'Authentication, XSS prevention, and secure practices',
    category: 'Security',
    icon: Shield,
    tags: ['security', 'auth', 'xss'],
  },
  {
    title: 'Performance Monitoring',
    file: 'PERFORMANCE_MONITORING_GUIDE.md',
    description: 'Web vitals, monitoring, and optimization',
    category: 'Performance',
    icon: Zap,
    tags: ['performance', 'monitoring', 'vitals'],
  },
  {
    title: 'API Caching',
    file: 'API_CACHING_GUIDE.md',
    description: 'Caching strategies and optimization',
    category: 'Performance',
    icon: Database,
    tags: ['caching', 'performance', 'optimization'],
  },

  // DevOps & Deployment
  {
    title: 'Git Workflow',
    file: 'GIT_WORKFLOW_GUIDE.md',
    description: 'Branching strategies and collaboration',
    category: 'DevOps',
    icon: GitBranch,
    tags: ['git', 'workflow', 'collaboration'],
  },
  {
    title: 'CI/CD',
    file: 'CI_CD_GUIDE.md',
    description: 'Continuous integration and deployment pipelines',
    category: 'DevOps',
    icon: Rocket,
    tags: ['ci-cd', 'github-actions', 'deployment'],
  },
  {
    title: 'Deployment',
    file: 'DEPLOYMENT_GUIDE.md',
    description: 'Production deployment strategies',
    category: 'DevOps',
    icon: Rocket,
    tags: ['deployment', 'production', 'hosting'],
  },
  {
    title: 'Environment Variables',
    file: 'ENVIRONMENT_VARIABLES_GUIDE.md',
    description: 'Managing environment configuration',
    category: 'DevOps',
    icon: FileCode,
    tags: ['env', 'config', 'secrets'],
  },
  {
    title: 'Source Maps',
    file: 'SOURCE_MAPS_GUIDE.md',
    description: 'Source map configuration and security',
    category: 'DevOps',
    icon: FileCode,
    tags: ['source-maps', 'debugging', 'sentry'],
  },
];

const categories = [
  { value: 'all', label: 'All Guides', count: guides.length },
  { value: 'Core', label: 'Core Development', count: guides.filter(g => g.category === 'Core').length },
  { value: 'UI', label: 'UI & Styling', count: guides.filter(g => g.category === 'UI').length },
  { value: 'Quality', label: 'Quality & Testing', count: guides.filter(g => g.category === 'Quality').length },
  { value: 'Security', label: 'Security', count: guides.filter(g => g.category === 'Security').length },
  { value: 'Performance', label: 'Performance', count: guides.filter(g => g.category === 'Performance').length },
  { value: 'DevOps', label: 'DevOps & Deployment', count: guides.filter(g => g.category === 'DevOps').length },
];

export default function DeveloperDocs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState(new Set(['Core', 'UI']));

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleGuideClick = (file) => {
    const path = `/components/common/${file}`;
    window.open(path, '_blank');
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  // Group guides by category
  const guidesByCategory = filteredGuides.reduce((acc, guide) => {
    if (!acc[guide.category]) acc[guide.category] = [];
    acc[guide.category].push(guide);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto -mt-6 bg-background min-h-screen">
      <PageHeader 
        title="Developer Documentation"
        description="Comprehensive guides for building with Base44"
      />

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          {categories.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
              <Badge variant="secondary" className="ml-2">
                {cat.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guides, topics, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Results */}
          {filteredGuides.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No guides found matching your search.</p>
              </CardContent>
            </Card>
          ) : selectedCategory === 'all' ? (
            // Show collapsible categories when viewing all
            <div className="space-y-3">
              {Object.entries(guidesByCategory).map(([category, categoryGuides]) => (
                <Collapsible
                  key={category}
                  open={expandedCategories.has(category)}
                  onOpenChange={() => toggleCategory(category)}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {expandedCategories.has(category) ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                            {category}
                          </CardTitle>
                          <Badge>{categoryGuides.length} guides</Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-2 pt-0">
                        {categoryGuides.map((guide) => {
                          const Icon = guide.icon;
                          return (
                            <Card 
                              key={guide.file}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGuideClick(guide.file);
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    <Icon className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium mb-1">{guide.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {guide.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {guide.tags.map(tag => (
                                        <Badge 
                                          key={tag} 
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          ) : (
            // Show full-width cards when filtering by category
            <div className="space-y-2">
              {filteredGuides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <Card 
                    key={guide.file}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleGuideClick(guide.file)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{guide.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {guide.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {guide.tags.map(tag => (
                              <Badge 
                                key={tag} 
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}