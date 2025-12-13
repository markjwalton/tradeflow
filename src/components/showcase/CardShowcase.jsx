import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, TrendingUp } from 'lucide-react';

export default function CardShowcase() {
  return (
    <div className="space-y-6" data-component="cardShowcase">
      <div>
        <h3 className="text-lg font-display mb-2">Cards</h3>
        <p className="text-sm text-muted-foreground">
          Card layouts using Sturij design tokens
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2" data-element="card-examples">
        <Card>
          <CardHeader>
            <CardTitle>Basic Card</CardTitle>
            <CardDescription>
              A simple card with header, content, and footer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              This is the card content area. You can add any content here.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">Action</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>With Badge</CardTitle>
              <Badge>Active</Badge>
            </div>
            <CardDescription>Card with status badge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>John Doe</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Dec 13, 2025</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Stat Card
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,234</div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <div className="mt-2 text-sm text-green-600">
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
            <CardDescription>Hover effect example</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              This card demonstrates interactive states with hover effects.
            </p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="outline">Secondary</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}