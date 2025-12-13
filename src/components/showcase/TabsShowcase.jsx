import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCode, Settings, User, Bell } from 'lucide-react';

export default function TabsShowcase() {
  const [selectedTab, setSelectedTab] = useState('account');

  return (
    <div className="space-y-6" data-component="tabsShowcase">
      <div>
        <h3 className="text-lg font-display mb-2">Tabs Component</h3>
        <p className="text-sm text-muted-foreground">
          Interactive tabbed interface with light green hover states on inactive tabs
        </p>
      </div>

      {/* Basic Tabs Example */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Basic Tabs</h4>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>General information and summary</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This is the overview tab content.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
                <CardDescription>Detailed information and data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This is the details tab content.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configuration options</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This is the settings tab content.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Tabs with Icons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Tabs with Icons</h4>
        <Tabs defaultValue="account" onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="code">
              <FileCode className="h-4 w-4 mr-2" />
              Code
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="mt-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm">Account settings and profile information</p>
            </div>
          </TabsContent>
          <TabsContent value="code" className="mt-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm">Code snippets and examples</p>
            </div>
          </TabsContent>
          <TabsContent value="preferences" className="mt-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm">User preferences and customization options</p>
            </div>
          </TabsContent>
          <TabsContent value="notifications" className="mt-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm">Notification settings and alerts</p>
            </div>
          </TabsContent>
        </Tabs>
        <p className="text-xs text-muted-foreground">
          Active tab: <span className="font-medium">{selectedTab}</span>
        </p>
      </div>

      {/* Full Width Grid Tabs */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Full Width Grid Tabs</h4>
        <Tabs defaultValue="tab1" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tab1">Tab One</TabsTrigger>
            <TabsTrigger value="tab2">Tab Two</TabsTrigger>
            <TabsTrigger value="tab3">Tab Three</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="mt-4">
            <div className="p-6 bg-muted/50 rounded-lg text-center">
              <p className="text-sm">Content for Tab One</p>
            </div>
          </TabsContent>
          <TabsContent value="tab2" className="mt-4">
            <div className="p-6 bg-muted/50 rounded-lg text-center">
              <p className="text-sm">Content for Tab Two</p>
            </div>
          </TabsContent>
          <TabsContent value="tab3" className="mt-4">
            <div className="p-6 bg-muted/50 rounded-lg text-center">
              <p className="text-sm">Content for Tab Three</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Design Tokens */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Hover Behavior</h4>
        <div className="p-4 border rounded-lg bg-muted/20 space-y-2">
          <p className="text-sm">
            <strong>Active state:</strong> White background with shadow
          </p>
          <p className="text-sm">
            <strong>Inactive hover:</strong> Light green background (primary-50) with green text (primary-700)
          </p>
          <p className="text-sm">
            <strong>Transition:</strong> Smooth transition on all properties
          </p>
        </div>
      </div>
    </div>
  );
}