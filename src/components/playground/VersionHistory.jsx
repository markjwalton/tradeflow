import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw, Check } from "lucide-react";
import moment from "moment";

export default function VersionHistory({ 
  versions = [], 
  currentVersion, 
  onRevert 
}) {
  if (!versions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No version history yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Version History ({versions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {[...versions].reverse().map((v, i) => (
              <div 
                key={v.version} 
                className={`p-3 rounded-lg border ${
                  v.version === currentVersion 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={v.version === currentVersion ? "default" : "outline"}>
                      v{v.version}
                    </Badge>
                    {v.version === currentVersion && (
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {moment(v.saved_date).format("DD MMM, HH:mm")}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{v.change_summary || "No summary"}</p>
                {v.version !== currentVersion && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="mt-2 h-7 text-xs"
                    onClick={() => onRevert(v.version)}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Revert to this version
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}