import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, User, MapPin, Phone, Mail, MessageSquare, FileText, FolderOpen, Plus } from 'lucide-react';
import InteractionTimeline from '../components/crm/InteractionTimeline';

export default function CRMCustomerDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('id');

  const { data: allCustomers = [], isLoading: customerLoading } = useQuery({
    queryKey: ['crmCustomers'],
    queryFn: () => base44.entities.CRMCustomer.list(),
    enabled: !!customerId,
  });

  const customer = customerId && allCustomers.length > 0 
    ? allCustomers.find(c => c.id === customerId) 
    : null;

  const { data: address } = useQuery({
    queryKey: ['address', customer?.primary_address_id],
    queryFn: () => base44.entities.Address.filter({ id: customer.primary_address_id }),
    enabled: !!customer?.primary_address_id,
  });

  const { data: enquiries = [] } = useQuery({
    queryKey: ['crmEnquiries', customerId],
    queryFn: () => base44.entities.CRMEnquiry.filter({ customer_id: customerId }),
    enabled: !!customerId,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['crmProjects', customerId],
    queryFn: () => base44.entities.CRMProject.filter({ customer_id: customerId }),
    enabled: !!customerId,
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['crmInteractions', customerId],
    queryFn: () => base44.entities.CRMInteraction.filter({ customer_id: customerId }),
    enabled: !!customerId,
  });

  const getTypeBadgeColor = (type) => {
    const colors = {
      Retail: 'bg-blue-100 text-blue-800',
      Trade: 'bg-green-100 text-green-800',
      Commercial: 'bg-purple-100 text-purple-800',
      Ecommerce: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (!customerId) {
    return (
      <div className="p-6">
        <p>No customer ID provided</p>
      </div>
    );
  }

  if (customerLoading || allCustomers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <p>Customer not found (ID: {customerId})</p>
        <p className="text-sm text-muted-foreground mt-2">Available customers: {allCustomers.length}</p>
      </div>
    );
  }

  const addressData = address?.[0];

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(createPageUrl('CRMCustomers'))}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Customers
      </Button>

      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold">
                    {customer.first_name} {customer.surname}
                  </h1>
                  <Badge className={getTypeBadgeColor(customer.customer_type)}>
                    {customer.customer_type}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-mono">
                  {customer.customer_number}
                </p>
              </div>
            </div>
            <Link to={createPageUrl('CRMCustomerForm') + `?id=${customer.id}`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <p className="font-medium">{customer.mobile}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{customer.email_address}</p>
              </div>
            </div>
            {addressData && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {[
                      addressData.name_number,
                      addressData.street,
                      addressData.city,
                      addressData.post_code,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="flex gap-2 mt-4">
            {customer.whatsapp_opt_in && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <MessageSquare className="h-3 w-3 mr-1" />
                WhatsApp
              </Badge>
            )}
            {customer.marketing_opt_in && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Marketing Opt-in
              </Badge>
            )}
            {customer.contact_methods?.map((method) => (
              <Badge key={method} variant="secondary">
                {method}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for related data */}
      <Tabs defaultValue="enquiries">
        <TabsList>
          <TabsTrigger value="enquiries" className="gap-2">
            <FileText className="h-4 w-4" />
            Enquiries ({enquiries.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="interactions" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Interactions ({interactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enquiries" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Enquiries</CardTitle>
              <Link to={createPageUrl('CRMEnquiryForm') + `?customer_id=${customer.id}`}>
                <Button size="sm">New Enquiry</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {enquiries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No enquiries yet
                </p>
              ) : (
                <div className="space-y-3">
                  {enquiries.map((enquiry) => (
                    <Link
                      key={enquiry.id}
                      to={createPageUrl('CRMEnquiryDetail') + `?id=${enquiry.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{enquiry.inbound_channel}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(enquiry.enquiry_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{enquiry.status}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No projects yet
                </p>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      to={createPageUrl('CRMProjectDetail') + `?id=${project.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">
                          {project.project_scope_types?.join(', ') || 'Project'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(project.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{project.status}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <InteractionTimeline
                interactions={interactions}
                customerId={customer.id}
                emptyMessage="No interactions logged for this customer"
              />
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
        </div>
        );
        }