import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, FileText, FolderKanban, MessageSquare, 
  Plus, ArrowRight, Clock, TrendingUp,
  Calendar, Phone, Settings
} from 'lucide-react';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

export default function CRMDashboard() {
  const { data: customers = [] } = useQuery({
    queryKey: ['crmCustomers'],
    queryFn: () => base44.entities.CRMCustomer.list('-created_date'),
  });

  const { data: enquiries = [] } = useQuery({
    queryKey: ['crmEnquiries'],
    queryFn: () => base44.entities.CRMEnquiry.list('-created_date'),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['crmProjects'],
    queryFn: () => base44.entities.CRMProject.list('-created_date'),
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['crmInteractions'],
    queryFn: () => base44.entities.CRMInteraction.list('-interaction_date', 10),
  });

  const customerMap = customers.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});

  // Pipeline stats
  const newEnquiries = enquiries.filter((e) => e.status === 'New').length;
  const qualifiedEnquiries = enquiries.filter((e) => e.status === 'Qualified').length;
  const activeProjects = projects.filter((p) => !['Completed', 'Archived'].includes(p.status)).length;

  // Recent activity
  const recentEnquiries = enquiries.slice(0, 5);

  const formatRelativeDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    const days = differenceInDays(new Date(), date);
    if (days < 7) return `${days} days ago`;
    return format(date, 'MMM d');
  };

  const getStatusColor = (status) => {
    const colors = {
      New: 'bg-blue-100 text-blue-800',
      Acknowledged: 'bg-yellow-100 text-yellow-800',
      Qualified: 'bg-green-100 text-green-800',
      ConvertedToProject: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">CRM Dashboard</h1>
          <p className="text-muted-foreground">Overview of your customer relationships</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl('CRMEnquiryForm')}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Enquiry
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-3xl font-bold">{customers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">New Enquiries</p>
                <p className="text-3xl font-bold text-blue-700">{newEnquiries}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Qualified</p>
                <p className="text-3xl font-bold text-green-700">{qualifiedEnquiries}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Active Projects</p>
                <p className="text-3xl font-bold text-purple-700">{activeProjects}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Enquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Enquiries</CardTitle>
              <CardDescription>Latest customer enquiries</CardDescription>
            </div>
            <Link to={createPageUrl('CRMEnquiries')}>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentEnquiries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No enquiries yet</p>
            ) : (
              <div className="space-y-3">
                {recentEnquiries.map((enquiry) => {
                  const customer = customerMap[enquiry.customer_id];
                  return (
                    <Link
                      key={enquiry.id}
                      to={createPageUrl('CRMEnquiryDetail') + `?id=${enquiry.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {customer?.first_name?.[0]}{customer?.surname?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {customer ? `${customer.first_name} ${customer.surname}` : 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">{enquiry.inbound_channel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(enquiry.status)}>{enquiry.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(enquiry.enquiry_date)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest interactions</CardDescription>
            </div>
            <Link to={createPageUrl('CRMInteractions')}>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {interactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No interactions logged</p>
            ) : (
              <div className="space-y-3">
                {interactions.map((interaction) => {
                  const customer = customerMap[interaction.customer_id];
                  return (
                    <div
                      key={interaction.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mt-0.5">
                        {interaction.interaction_type === 'Phone Call' ? (
                          <Phone className="h-4 w-4" />
                        ) : interaction.interaction_type === 'Design Visit' ? (
                          <Calendar className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">
                            {customer ? `${customer.first_name} ${customer.surname}` : 'Unknown'}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatRelativeDate(interaction.interaction_date)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {interaction.interaction_type}
                        </p>
                        <p className="text-sm line-clamp-2 mt-1">{interaction.summary_notes}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link to={createPageUrl('CRMCustomerForm')}>
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Users className="h-5 w-5" />
                <span>Add Customer</span>
              </Button>
            </Link>
            <Link to={createPageUrl('CRMEnquiryForm')}>
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span>New Enquiry</span>
              </Button>
            </Link>
            <Link to={createPageUrl('CRMInteractionForm')}>
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <MessageSquare className="h-5 w-5" />
                <span>Log Interaction</span>
              </Button>
            </Link>
            <Link to={createPageUrl('CRMProjectForm')}>
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <FolderKanban className="h-5 w-5" />
                <span>New Project</span>
              </Button>
            </Link>
            <Link to={createPageUrl('CRMSettings')}>
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Settings className="h-5 w-5" />
                <span>CRM Settings</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}