import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Shield, CheckCircle2, XCircle, AlertTriangle, RefreshCw 
} from "lucide-react";

export default function EntitySchemaValidator({ 
  isOpen, 
  onClose, 
  validationResults,
  onRevalidate 
}) {
  if (!validationResults) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Entity Schema Validation Report
          </DialogTitle>
          <DialogDescription>
            Validates all entity templates have proper schemas for test data generation
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{validationResults.totalEntities}</div>
                <div className="text-sm text-gray-500">Total Entities</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-700">{validationResults.validEntities}</div>
                <div className="text-sm text-green-600">Valid Schemas</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-700">{validationResults.missingSchemas}</div>
                <div className="text-sm text-red-600">Missing/Empty</div>
              </CardContent>
            </Card>
            <Card className={validationResults.invalidEntities === 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
              <CardContent className="pt-4">
                <div className={`text-2xl font-bold ${validationResults.invalidEntities === 0 ? "text-green-700" : "text-amber-700"}`}>
                  {validationResults.invalidEntities === 0 ? "✓" : validationResults.invalidEntities}
                </div>
                <div className={`text-sm ${validationResults.invalidEntities === 0 ? "text-green-600" : "text-amber-600"}`}>
                  {validationResults.invalidEntities === 0 ? "All Valid!" : "Need Attention"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entity Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Entity Name</TableHead>
                  <TableHead className="text-center">Properties</TableHead>
                  <TableHead className="text-center">Required</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validationResults.entities.map((entity) => (
                  <TableRow key={entity.id} className={entity.status !== "valid" ? "bg-red-50" : ""}>
                    <TableCell>
                      {entity.status === "valid" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{entity.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={entity.propertyCount > 0 ? "secondary" : "destructive"}>
                        {entity.propertyCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{entity.requiredFields}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {entity.properties.slice(0, 5).map(prop => (
                          <Badge key={prop} variant="outline" className="text-xs">
                            {prop}
                          </Badge>
                        ))}
                        {entity.properties.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{entity.properties.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {entity.issues.length > 0 ? (
                        <span className="text-red-600 text-sm">{entity.issues.join(", ")}</span>
                      ) : (
                        <span className="text-green-600 text-sm">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-xs text-gray-400">
            Validated at: {new Date(validationResults.timestamp).toLocaleString()}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onRevalidate}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-validate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}