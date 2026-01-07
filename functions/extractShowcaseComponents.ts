import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Component definitions extracted from showcase pages
    const componentDefinitions = [
      // Buttons
      {
        name: 'Button - Default',
        slug: 'button-default',
        category: 'Components',
        description: 'Primary button with default styling',
        tags: ['button', 'cta', 'interactive', 'shadcn'],
        grid_suitability: 'inline',
        functional_specification: 'Standard button for primary actions',
        jsx_code: '<Button>Default</Button>',
        style_token_references: ['--color-primary', '--color-primary-foreground', '--radius-button', '--shadow-sm'],
        style_class_names: ['bg-[var(--color-primary)]', 'text-[var(--color-primary-foreground)]', 'rounded-[var(--radius-button)]']
      },
      {
        name: 'Button - Secondary',
        slug: 'button-secondary',
        category: 'Components',
        description: 'Secondary button variant',
        tags: ['button', 'secondary', 'interactive', 'shadcn'],
        grid_suitability: 'inline',
        functional_specification: 'Button for secondary actions',
        jsx_code: '<Button variant="secondary">Secondary</Button>',
        style_token_references: ['--color-secondary', '--color-secondary-foreground', '--radius-button', '--shadow-sm'],
        style_class_names: ['bg-[var(--color-secondary)]', 'text-[var(--color-secondary-foreground)]']
      },
      {
        name: 'Button - Outline',
        slug: 'button-outline',
        category: 'Components',
        description: 'Outlined button variant',
        tags: ['button', 'outline', 'interactive', 'shadcn'],
        grid_suitability: 'inline',
        functional_specification: 'Subtle button with border only',
        jsx_code: '<Button variant="outline">Outline</Button>',
        style_token_references: ['--color-border', '--color-text-secondary', '--radius-button'],
        style_class_names: ['border', 'border-[var(--color-border)]', 'text-[var(--color-text-secondary)]']
      },
      {
        name: 'Button - Ghost',
        slug: 'button-ghost',
        category: 'Components',
        description: 'Minimal ghost button',
        tags: ['button', 'ghost', 'minimal', 'shadcn'],
        grid_suitability: 'inline',
        functional_specification: 'Minimal button for tertiary actions',
        jsx_code: '<Button variant="ghost">Ghost</Button>',
        style_token_references: ['--color-text-secondary', '--color-muted'],
        style_class_names: ['text-[var(--color-text-secondary)]', 'hover:bg-[var(--color-muted)]']
      },
      {
        name: 'Button - Destructive',
        slug: 'button-destructive',
        category: 'Components',
        description: 'Destructive action button',
        tags: ['button', 'destructive', 'danger', 'shadcn'],
        grid_suitability: 'inline',
        functional_specification: 'Button for destructive or dangerous actions',
        jsx_code: '<Button variant="destructive">Destructive</Button>',
        style_token_references: ['--color-destructive', '--color-destructive-foreground', '--radius-button', '--shadow-sm'],
        style_class_names: ['bg-[var(--color-destructive)]', 'text-[var(--color-destructive-foreground)]']
      },
      // Cards
      {
        name: 'Card - Basic',
        slug: 'card-basic',
        category: 'Layout',
        description: 'Standard card with header, content, and footer',
        tags: ['card', 'container', 'layout', 'shadcn'],
        grid_suitability: 'card',
        functional_specification: 'Container for grouped content with optional header and footer',
        jsx_code: `<Card>
  <CardHeader>
    <CardTitle>Basic Card</CardTitle>
    <CardDescription>A simple card with header, content, and footer</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm">This is the card content area.</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline" size="sm">Action</Button>
  </CardFooter>
</Card>`,
        style_token_references: ['--color-card', '--color-border', '--radius-xl', '--shadow-card'],
        style_class_names: ['bg-[var(--color-card)]', 'border-[var(--color-border)]', 'rounded-[var(--radius-xl)]', 'shadow-[var(--shadow-card)]']
      },
      {
        name: 'Card - Stat Card',
        slug: 'card-stat',
        category: 'Data Display',
        description: 'Card optimized for displaying statistics',
        tags: ['card', 'stat', 'metric', 'dashboard'],
        grid_suitability: 'card',
        functional_specification: 'Display numeric metrics with icon and trend indicators',
        jsx_code: `<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <TrendingUp className="h-5 w-5 text-primary" />
      Stat Card
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">1,234</div>
    <p className="text-sm text-muted-foreground">Total Users</p>
    <div className="mt-2 text-sm text-green-600">+12% from last month</div>
  </CardContent>
</Card>`,
        style_token_references: ['--color-card', '--color-border', '--radius-xl', '--shadow-card', '--color-primary'],
        style_class_names: ['bg-[var(--color-card)]', 'border-[var(--color-border)]', 'rounded-[var(--radius-xl)]']
      },
      // Typography
      {
        name: 'Heading - H1',
        slug: 'heading-h1',
        category: 'Foundations',
        description: 'Primary page heading',
        tags: ['typography', 'heading', 'h1'],
        grid_suitability: 'full-width',
        functional_specification: 'Main page title or section heading',
        jsx_code: '<h1 className="text-2xl font-light">Page Title</h1>',
        style_token_references: ['--text-2xl', '--font-weight-normal', '--color-text-primary'],
        style_class_names: ['text-[var(--text-2xl)]', 'font-light', 'text-[var(--color-text-primary)]']
      },
      {
        name: 'Heading - H2',
        slug: 'heading-h2',
        category: 'Foundations',
        description: 'Secondary section heading',
        tags: ['typography', 'heading', 'h2'],
        grid_suitability: 'full-width',
        functional_specification: 'Section or subsection heading',
        jsx_code: '<h2 className="text-xl font-light">Section Title</h2>',
        style_token_references: ['--text-xl', '--font-weight-normal', '--color-text-primary'],
        style_class_names: ['text-[var(--text-xl)]', 'font-light']
      },
      {
        name: 'Body Text',
        slug: 'body-text',
        category: 'Foundations',
        description: 'Standard body text paragraph',
        tags: ['typography', 'body', 'text'],
        grid_suitability: 'flexible',
        functional_specification: 'Regular paragraph text for content',
        jsx_code: '<p className="text-base">Body text content here.</p>',
        style_token_references: ['--text-base', '--color-text-primary', '--font-family-body'],
        style_class_names: ['text-[var(--text-base)]', 'text-[var(--color-text-primary)]']
      }
    ];

    const createdComponents = [];
    
    for (const def of componentDefinitions) {
      // Create Component
      const component = await base44.entities.Component.create({
        name: def.name,
        slug: def.slug,
        category: def.category,
        description: def.description,
        tags: def.tags,
        grid_suitability: def.grid_suitability,
        functional_specification: def.functional_specification,
        is_global: true
      });

      // Create initial version (1.0.0)
      const version = await base44.entities.ComponentVersion.create({
        component_id: component.id,
        version_number: '1.0.0',
        status: 'approved',
        jsx_code: def.jsx_code,
        usage_notes: `Initial version of ${def.name}`,
        style_class_names: def.style_class_names,
        style_token_references: def.style_token_references,
        change_summary: 'Initial component creation',
        published_date: new Date().toISOString()
      });

      // Update component with latest version reference
      await base44.entities.Component.update(component.id, {
        latest_version_id: version.id
      });

      createdComponents.push({
        component,
        version
      });
    }

    return Response.json({
      success: true,
      message: `Created ${createdComponents.length} components with initial versions`,
      components: createdComponents
    });

  } catch (error) {
    console.error('Error extracting components:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});