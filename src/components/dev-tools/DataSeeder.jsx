import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { mockGenerators } from './mockDataGenerators';
import { toast } from 'sonner';

export function DataSeeder() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [counts, setCounts] = useState({
    projects: 10,
    customers: 15,
    teamMembers: 8,
    tasks: 30,
    roadmapItems: 20,
  });

  const seedEntity = async (entityName, generator, count, additionalData = {}) => {
    const records = [];
    for (let i = 0; i < count; i++) {
      records.push(generator(additionalData));
    }
    
    for (const record of records) {
      await base44.entities[entityName].create(record);
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    setStatus({ type: 'loading', message: 'Seeding data...' });

    try {
      // Seed customers first (no dependencies)
      setStatus({ type: 'loading', message: 'Creating customers...' });
      await seedEntity('Customer', mockGenerators.customer, counts.customers);

      // Seed team members (no dependencies)
      setStatus({ type: 'loading', message: 'Creating team members...' });
      await seedEntity('TeamMember', mockGenerators.teamMember, counts.teamMembers);

      // Get customers for projects
      const customers = await base44.entities.Customer.list();
      
      // Seed projects
      setStatus({ type: 'loading', message: 'Creating projects...' });
      const projectIds = [];
      for (let i = 0; i < counts.projects; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const project = await base44.entities.Project.create(
          mockGenerators.project({ customerId: customer?.id })
        );
        projectIds.push(project.id);
      }

      // Get team members for task assignment
      const teamMembers = await base44.entities.TeamMember.list();

      // Seed tasks
      setStatus({ type: 'loading', message: 'Creating tasks...' });
      for (let i = 0; i < counts.tasks; i++) {
        const projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
        const assignedTo = teamMembers[Math.floor(Math.random() * teamMembers.length)]?.id;
        await base44.entities.Task.create(
          mockGenerators.task(projectId, { assignedTo })
        );
      }

      // Seed roadmap items (no dependencies)
      setStatus({ type: 'loading', message: 'Creating roadmap items...' });
      await seedEntity('RoadmapItem', mockGenerators.roadmapItem, counts.roadmapItems);

      setStatus({ type: 'success', message: 'Data seeded successfully!' });
      toast.success('Data seeded successfully');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
      toast.error('Failed to seed data');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
      return;
    }

    setLoading(true);
    setStatus({ type: 'loading', message: 'Clearing data...' });

    try {
      const entities = ['Task', 'Project', 'Customer', 'TeamMember', 'RoadmapItem'];
      
      for (const entityName of entities) {
        setStatus({ type: 'loading', message: `Deleting ${entityName}...` });
        const records = await base44.entities[entityName].list();
        for (const record of records) {
          await base44.entities[entityName].delete(record.id);
        }
      }

      setStatus({ type: 'success', message: 'All data cleared!' });
      toast.success('All data cleared');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
      toast.error('Failed to clear data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Development Data Seeder</h1>
        <p className="text-muted-foreground">
          Generate mock data for development and testing purposes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seed Configuration</CardTitle>
          <CardDescription>
            Configure how many records to generate for each entity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(counts).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Input
                  id={key}
                  type="number"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => setCounts({ ...counts, [key]: parseInt(e.target.value) || 0 })}
                  disabled={loading}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSeedData}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Seed Data
            </Button>
            <Button
              onClick={handleClearData}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {status && (
        <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
          {status.type === 'success' && <CheckCircle className="h-4 w-4" />}
          {status.type === 'error' && <AlertCircle className="h-4 w-4" />}
          {status.type === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>⚠️ Warning</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This tool is for development purposes only. Make sure you're not using it in a production environment.
            Always backup your data before clearing or seeding.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}