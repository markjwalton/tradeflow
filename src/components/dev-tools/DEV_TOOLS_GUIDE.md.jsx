# Development Tools Guide

## Overview
Comprehensive development utilities for efficient development, testing, and debugging.

## Features

### 1. Data Seeder
Generate realistic mock data for all entities in your application.

#### Usage
```jsx
import { DataSeeder } from '@/components/dev-tools/DataSeeder';

function DevelopmentPage() {
  return <DataSeeder />;
}
```

#### What it Seeds
- **Projects**: Complete project data with customers, budgets, timelines
- **Tasks**: Tasks linked to projects with team assignments
- **Customers**: Customer records with contact information
- **Team Members**: Team data with skills and availability
- **Roadmap Items**: Feature requests and development items

#### Configuration
- Adjust counts for each entity type
- Seed data preserves relationships (tasks → projects, projects → customers)
- Clear all data with one click (with confirmation)

### 2. Mock Data Generators
Reusable generators for creating test data.

#### Usage
```javascript
import { mockGenerators } from '@/components/dev-tools/mockDataGenerators';

// Generate a single project
const project = mockGenerators.project();

// Generate with overrides
const highPriorityProject = mockGenerators.project({
  isHighPriority: true,
  budget: 1000000
});

// Generate multiple items
const projects = Array.from({ length: 10 }, () => mockGenerators.project());
```

#### Available Generators
- `mockGenerators.project(overrides)`
- `mockGenerators.task(projectId, overrides)`
- `mockGenerators.customer(overrides)`
- `mockGenerators.teamMember(overrides)`
- `mockGenerators.roadmapItem(overrides)`

### 3. Dev Tools Panel
Floating panel with development utilities.

#### Features
- **Performance Tab**: Real-time Core Web Vitals monitoring
- **Data Tab**: Quick access to data seeding
- **Debug Tab**: Environment info, storage management

#### Usage
```jsx
import { DevToolsPanel } from '@/components/dev-tools/DevToolsPanel';

function App() {
  return (
    <>
      {/* Your app content */}
      {process.env.NODE_ENV === 'development' && <DevToolsPanel />}
    </>
  );
}
```

## Testing Workflows

### 1. Fresh Start Workflow
```
1. Clear all data
2. Seed new data with desired counts
3. Navigate to different pages to test
4. Monitor performance in Dev Tools Panel
```

### 2. Specific Scenario Testing
```javascript
// Create specific test scenario
const urgentProject = await base44.entities.Project.create(
  mockGenerators.project({
    isHighPriority: true,
    status: 'Active',
    estimatedEndDate: '2025-01-01' // Near deadline
  })
);

// Add related tasks
for (let i = 0; i < 5; i++) {
  await base44.entities.Task.create(
    mockGenerators.task(urgentProject.id, {
      priority: 'Critical',
      status: 'In Progress'
    })
  );
}
```

### 3. Performance Testing
```
1. Seed large dataset (50+ projects, 200+ tasks)
2. Monitor performance in Dev Tools Panel
3. Check for budget violations
4. Optimize based on recommendations
```

## Best Practices

### Development
1. **Always seed data first** when starting development
2. **Use realistic counts** that match production scenarios
3. **Test with various data volumes** (small, medium, large)
4. **Clear data regularly** to avoid stale records

### Testing
1. **Create specific test scenarios** rather than random data
2. **Test edge cases** with extreme values
3. **Verify relationships** between entities
4. **Test with empty states** by clearing data

### Performance
1. **Monitor metrics** while seeding data
2. **Check budget compliance** after major changes
3. **Test on different devices** using debug info
4. **Profile slow operations** with custom marks

## Integration with Other Tools

### With Performance Monitoring
```javascript
import { usePerformanceMark } from '@/components/monitoring/usePerformanceMonitoring';

function DataSeedingOperation() {
  usePerformanceMark('seed-start');
  
  // Seeding operation
  await seedData();
  
  performance.mark('seed-end');
  // Measure duration for optimization
}
```

### With Error Handling
```javascript
import { useErrorHandler } from '@/components/common/useErrorHandler';

function SeedWithErrorHandling() {
  const { handleError } = useErrorHandler();
  
  try {
    await seedData();
  } catch (error) {
    handleError(error, {
      customMessage: 'Failed to seed data',
      showToast: true
    });
  }
}
```

## Environment Setup

### Development Only
The Dev Tools Panel automatically shows only in development:
```javascript
if (process.env.NODE_ENV === 'development') {
  // Show dev tools
}
```

### Production Safety
Data seeding operations should never run in production:
```javascript
if (process.env.NODE_ENV === 'production') {
  console.warn('Data seeding disabled in production');
  return;
}
```

## Keyboard Shortcuts (Future Enhancement)
- `Cmd/Ctrl + K`: Toggle Dev Tools Panel
- `Cmd/Ctrl + Shift + D`: Seed default dataset
- `Cmd/Ctrl + Shift + C`: Clear all data

## Tips & Tricks

1. **Seed Before Screenshots**: Generate realistic data before taking screenshots
2. **Version Control**: Don't commit seeded data, use seeders in git
3. **CI/CD**: Use seeders in test environments for consistent test data
4. **Demo Mode**: Seed polished data for demos and presentations
5. **Bug Reproduction**: Create specific scenarios to reproduce bugs