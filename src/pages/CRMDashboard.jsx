import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, FileText, FolderKanban, MessageSquare, 
  Plus, ArrowRight, Clock, TrendingUp,
  Calendar, Phone, Settings, LayoutDashboard
} from 'lucide-react';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { CRMPageHeader, CRMCard, CRMCardContent, CRMCardHeader } from '../components/crm/CRMUI';

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
    <div className="space-y-6">
      <CRMPageHeader
        title="CRM Dashboard"
        description="Overview of your customer relationships"
        icon={LayoutDashboard}
        actions={
          <Link to={createPageUrl('CRMEnquiryForm')}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Enquiry
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CRMCard>
          <CRMCardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{customers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CRMCardContent>
        </CRMCard>

        <CRMCard className="border" style={{ borderColor: 'var(--primary-200)', backgroundColor: 'var(--primary-50)' }}>
          <CRMCardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--primary-600)' }}>New Enquiries</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--primary-700)' }}>{newEnquiries}</p>
              </div>
              <FileText className="h-8 w-8" style={{ color: 'var(--primary-400)' }} />
            </div>
          </CRMCardContent>
        </CRMCard>

        <CRMCard className="border" style={{ borderColor: 'var(--secondary-200)', backgroundColor: 'var(--secondary-50)' }}>
          <CRMCardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--secondary-600)' }}>Qualified</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--secondary-700)' }}>{qualifiedEnquiries}</p>
              </div>
              <TrendingUp className="h-8 w-8" style={{ color: 'var(--secondary-400)' }} />
            </div>
          </CRMCardContent>
        </CRMCard>

        <CRMCard className="border" style={{ borderColor: 'var(--accent-200)', backgroundColor: 'var(--accent-50)' }}>
          <CRMCardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--accent-600)' }}>Active Projects</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--accent-700)' }}>{activeProjects}</p>
              </div>
              <FolderKanban className="h-8 w-8" style={{ color: 'var(--accent-400)' }} />
            </div>
          </CRMCardContent>
        </CRMCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Enquiries */}
        <CRMCard>
          <CRMCardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Enquiries</h3>
              <p className="text-sm text-muted-foreground">Latest customer enquiries</p>
            </div>
            <Link to={createPageUrl('CRMEnquiries')}>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CRMCardHeader>
          <CRMCardContent>
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
          </CRMCardContent>
        </CRMCard>

        {/* Recent Activity */}
        <CRMCard>
          <CRMCardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Latest interactions</p>
            </div>
            <Link to={createPageUrl('CRMInteractions')}>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CRMCardHeader>
          <CRMCardContent>
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
          </CRMCardContent>
        </CRMCard>
      </div>

      {/* Quick Actions */}
      <CRMCard>
        <CRMCardHeader>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
        </CRMCardHeader>
        <CRMCardContent>
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
        </CRMCardContent>
      </CRMCard>
    </div>
  );
}