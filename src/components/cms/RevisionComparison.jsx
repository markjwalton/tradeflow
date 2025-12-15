import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

export function RevisionComparison({ version1, version2 }) {
  const content1 = JSON.parse(version1.content_snapshot);
  const content2 = JSON.parse(version2.content_snapshot);

  const changes = [];
  const allKeys = new Set([...Object.keys(content1), ...Object.keys(content2)]);

  allKeys.forEach((key) => {
    if (JSON.stringify(content1[key]) !== JSON.stringify(content2[key])) {
      changes.push({
        field: key,
        before: content1[key],
        after: content2[key],
      });
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="outline">Version {version1.version_number}</Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(version1.created_date), 'PPp')}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div>
          <Badge variant="outline">Version {version2.version_number}</Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(version2.created_date), 'PPp')}
          </p>
        </div>
      </div>

      {changes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No changes detected
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {changes.map((change, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-sm">{change.field}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Before:</p>
                    <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                      {typeof change.before === 'object'
                        ? JSON.stringify(change.before, null, 2)
                        : String(change.before || '(empty)')}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">After:</p>
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                      {typeof change.after === 'object'
                        ? JSON.stringify(change.after, null, 2)
                        : String(change.after || '(empty)')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}