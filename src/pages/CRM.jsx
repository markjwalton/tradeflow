import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Users, FileText, FolderOpen, MessageSquare, Settings } from 'lucide-react';

// Import tab components
import CRMDashboardTab from '@/components/crm/tabs/CRMDashboardTab';
import CRMCustomersTab from '@/components/crm/tabs/CRMCustomersTab';
import CRMEnquiriesTab from '@/components/crm/tabs/CRMEnquiriesTab';
import CRMProjectsTab from '@/components/crm/tabs/CRMProjectsTab';
import CRMInteractionsTab from '@/components/crm/tabs/CRMInteractionsTab';
import CRMSettingsTab from '@/components/crm/tabs/CRMSettingsTab';

export default function CRM() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6 -mt-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b bg-card sticky top-0 z-10">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none">
            <TabsTrigger 
              value="dashboard" 
              className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="customers" 
              className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger 
              value="enquiries" 
              className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <FileText className="h-4 w-4" />
              Enquiries
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <FolderOpen className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger 
              value="interactions" 
              className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <MessageSquare className="h-4 w-4" />
              Interactions
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="dashboard" className="m-0">
            <CRMDashboardTab />
          </TabsContent>
          <TabsContent value="customers" className="m-0">
            <CRMCustomersTab />
          </TabsContent>
          <TabsContent value="enquiries" className="m-0">
            <CRMEnquiriesTab />
          </TabsContent>
          <TabsContent value="projects" className="m-0">
            <CRMProjectsTab />
          </TabsContent>
          <TabsContent value="interactions" className="m-0">
            <CRMInteractionsTab />
          </TabsContent>
          <TabsContent value="settings" className="m-0">
            <CRMSettingsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}