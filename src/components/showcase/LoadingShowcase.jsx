import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PageLoader,
  InlineLoader,
  TableLoader,
  CardGridLoader,
  ListLoader,
  FormLoader,
  StatsLoader,
  ButtonLoader,
} from '@/components/common/LoadingStates';

export default function LoadingShowcase() {
  const [activeDemo, setActiveDemo] = useState('page');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-display mb-2">Loading States</h3>
        <p className="text-sm text-muted-foreground">
          Skeleton loaders provide visual feedback during data fetching
        </p>
      </div>

      <Tabs value={activeDemo} onValueChange={setActiveDemo}>
        <TabsList>
          <TabsTrigger value="page">Page</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="page" className="mt-4">
          <div data-component="loadingCard" data-element="page-loader">
            <PageLoader message="Loading your data..." />
          </div>
        </TabsContent>

        <TabsContent value="cards" className="mt-4">
          <div data-component="loadingCard" data-element="card-grid-loader">
            <CardGridLoader columns={3} count={6} />
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <div data-component="loadingCard" data-element="table-loader">
            <TableLoader columns={5} rows={8} />
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <div data-component="loadingCard" data-element="list-loader">
            <ListLoader count={5} />
          </div>
        </TabsContent>

        <TabsContent value="form" className="mt-4">
          <div data-component="loadingCard" data-element="form-loader">
            <FormLoader />
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div data-component="loadingCard" data-element="stats-loader">
            <StatsLoader count={4} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-sm font-medium">Button Loader</h4>
        <div className="flex gap-3">
          <Button disabled>
            <ButtonLoader />
            Loading...
          </Button>
          <div data-component="loadingCard" data-element="inline-loader">
            <InlineLoader text="Processing..." />
          </div>
        </div>
      </div>
    </div>
  );
}