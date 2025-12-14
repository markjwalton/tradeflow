import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Clock,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight,
  Plus
} from "lucide-react";
import { PageHeader } from "@/components/sturij";

export default function ComponentPatterns() {
  // Analytics cards pattern from Figma
  const analyticsCards = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      trend: "up",
      period: "from last month",
      icon: Users,
    },
    {
      title: "Active Sessions",
      value: "1,429",
      change: "+7%",
      trend: "up",
      period: "from last week",
      icon: Activity,
    },
    {
      title: "Growth Rate",
      value: "+24%",
      change: "+4%",
      trend: "up",
      period: "from last month",
      icon: TrendingUp,
    },
    {
      title: "Conversion",
      value: "3.2%",
      change: "+0.5%",
      trend: "up",
      period: "from last month",
      icon: BarChart3,
    },
  ];

  // Activity feed pattern
  const activities = [
    { title: "New user registration", time: "2 minutes ago", type: "success" },
    { title: "System backup completed", time: "1 hour ago", type: "info" },
    { title: "Performance alert triggered", time: "3 hours ago", type: "warning" },
    { title: "Database maintenance scheduled", time: "1 day ago", type: "info" },
  ];

  return (
    <div className="max-w-7xl mx-auto -mt-6 space-y-8">
      <PageHeader 
        title="Component Patterns"
        description="Real-world patterns and layouts extracted from the design system"
      />

      {/* Dashboard Header Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Header Pattern</CardTitle>
          <CardDescription>
            Page header with title, description, and action buttons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-primary-100 text-primary-700 border-0">Live</Badge>
                </div>
                <h2 className="text-2xl font-light font-display">Dashboard</h2>
                <p className="text-muted-foreground mt-1">
                  Overview of system performance and key metrics
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">Export Data</Button>
                <Button className="bg-primary text-white">Generate Report</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview Cards</CardTitle>
          <CardDescription>
            Key metrics display with trends and comparisons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Analytics Overview</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Key metrics and performance indicators
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsCards.map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <Card key={idx} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            {metric.title}
                          </h4>
                          <p className="text-3xl font-light font-display">
                            {metric.value}
                          </p>
                        </div>
                        <div className="p-2 bg-primary-50 rounded-lg">
                          <Icon className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-success font-medium">{metric.change}</span>
                        <span className="text-muted-foreground">{metric.period}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed Pattern</CardTitle>
          <CardDescription>
            Timeline of recent events and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Latest updates and notifications
            </p>
            
            <div className="space-y-3">
              {activities.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="mt-0.5">
                    {activity.type === "success" && (
                      <div className="p-1.5 bg-primary-50 rounded-full">
                        <CheckCircle2 className="h-4 w-4 text-primary-600" />
                      </div>
                    )}
                    {activity.type === "warning" && (
                      <div className="p-1.5 bg-secondary-50 rounded-full">
                        <AlertCircle className="h-4 w-4 text-secondary-600" />
                      </div>
                    )}
                    {activity.type === "info" && (
                      <div className="p-1.5 bg-accent-50 rounded-full">
                        <Info className="h-4 w-4 text-accent-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Cards Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Action Card Grid</CardTitle>
          <CardDescription>
            Clickable cards for navigation or actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Products", desc: "Manage your product catalog", icon: "📦" },
              { title: "Workflow Editor", desc: "Build custom workflows", icon: "⚙️" },
              { title: "Templates", desc: "Pre-built workflow templates", icon: "📋" },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="cursor-pointer hover:shadow-md hover:border-primary-300 transition-all hover:-translate-y-0.5 group"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{item.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Empty State Pattern</CardTitle>
          <CardDescription>
            Encouraging state when no content exists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <div className="inline-flex p-4 bg-muted rounded-full mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No data yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first item. You'll see your data appear here once you add it.
            </p>
            <Button className="bg-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create First Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Layout Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Form Layout Pattern</CardTitle>
          <CardDescription>
            Standard form with labels, inputs, and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 max-w-2xl">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Input placeholder="Enter project name..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Brief description..." />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select className="w-full px-3 py-2 border rounded-lg bg-white">
                    <option>Active</option>
                    <option>Planning</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-primary text-white">Save Project</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}