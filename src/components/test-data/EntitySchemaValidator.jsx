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
            <Shield className="h-5 w-5 text-info" />
            Entity Schema Validation Report
          </DialogTitle>
          <DialogDescription>
            Validates all entity templates have proper schemas for test data generation
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-muted">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{validationResults.totalEntities}</div>
                <div className="text-sm text-muted-foreground">Total Entities</div>
              </CardContent>
            </Card>
            <Card className="bg-success-50 border-success/20">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-success">{validationResults.validEntities}</div>
                <div className="text-sm text-success">Valid Schemas</div>
              </CardContent>
            </Card>
            <Card className="bg-destructive-50 border-destructive/20">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-destructive">{validationResults.missingSchemas}</div>
                <div className="text-sm text-destructive">Missing/Empty</div>
              </CardContent>
            </Card>
            <Card className={validationResults.invalidEntities === 0 ? "bg-success-50 border-success/20" : "bg-warning/10 border-warning/20"}>
              <CardContent className="pt-4">
                <div className={`text-2xl font-bold ${validationResults.invalidEntities === 0 ? "text-success" : "text-warning"}`}>
                  {validationResults.invalidEntities === 0 ? "✓" : validationResults.invalidEntities}
                </div>
                <div className={`text-sm ${validationResults.invalidEntities === 0 ? "text-success" : "text-warning"}`}>
                  {validationResults.invalidEntities === 0 ? "All Valid!" : "Need Attention"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entity Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
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
                  <TableRow key={entity.id} className={entity.status !== "valid" ? "bg-destructive-50" : ""}>
                    <TableCell>
                      {entity.status === "valid" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
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
                        <span className="text-destructive text-sm">{entity.issues.join(", ")}</span>
                      ) : (
                        <span className="text-success text-sm">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-xs text-muted-foreground">
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