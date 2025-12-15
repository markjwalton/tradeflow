import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Package } from 'lucide-react';

export function PackageManager({ websiteFolderId }) {
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.CMSPackage.list(),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading packages...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button>
          <Package className="h-4 w-4 mr-2" />
          Create Package
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <Badge>{pkg.version}</Badge>
              </div>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="flex-1">
                  Install
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No packages yet</p>
        </div>
      )}
    </div>
  );
}