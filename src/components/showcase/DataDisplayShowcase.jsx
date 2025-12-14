import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, DollarSign, Package } from 'lucide-react';

export default function DataDisplayShowcase() {
  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'active' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', status: 'inactive' },
  ];

  return (
    <div className="space-y-8" data-component="dataDisplayShowcase">
      {/* Stats Cards */}
      <div data-element="stats-cards">
        <h3 className="text-lg font-medium mb-3">Stats Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">$45,231</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>+12.5% from last month</span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Active Users</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">2,543</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>+5.2% from last month</span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Orders</p>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">1,234</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span>-3.2% from last month</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Data Table */}
      <div data-element="data-table">
        <h3 className="text-lg font-medium mb-3">Data Table</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tableData.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{row.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant="outline">{row.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge className={row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key-Value Pairs */}
      <div data-element="key-value">
        <h3 className="text-lg font-medium mb-3">Key-Value Display</h3>
        <Card className="p-4">
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Project Name:</dt>
              <dd className="text-sm font-medium">Alpha Project</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Status:</dt>
              <dd><Badge className="bg-green-100 text-green-800">Active</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Start Date:</dt>
              <dd className="text-sm font-medium">Jan 1, 2024</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Team Size:</dt>
              <dd className="text-sm font-medium">8 members</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Progress Bars */}
      <div data-element="progress-bars">
        <h3 className="text-lg font-medium mb-3">Progress Bars</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Project Progress</span>
              <span className="text-muted-foreground">75%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Storage Used</span>
              <span className="text-muted-foreground">45%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-warning rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Budget</span>
              <span className="text-muted-foreground">90%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-destructive rounded-full" style={{ width: '90%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}