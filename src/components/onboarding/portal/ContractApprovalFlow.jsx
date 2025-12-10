import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileSignature, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ContractApprovalFlow({ sessionId, currentUser }) {
  const queryClient = useQueryClient();
  const [signatures, setSignatures] = useState({});

  const { data: approvals = [] } = useQuery({
    queryKey: ["contractApprovals", sessionId],
    queryFn: () => base44.entities.ContractApproval.filter({ onboarding_session_id: sessionId }),
  });

  const contractTypes = [
    { key: "master_agreement", label: "Master Service Agreement", required: true },
    { key: "sla", label: "Service Level Agreement", required: true },
    { key: "dr_policy", label: "Disaster Recovery Policy", required: true },
    { key: "support_terms", label: "Support Terms", required: true },
    { key: "privacy_policy", label: "Privacy Policy", required: true },
    { key: "data_processing", label: "Data Processing Agreement", required: false },
  ];

  const approveMutation = useMutation({
    mutationFn: async (contractType) => {
      const existing = approvals.find(a => a.contract_type === contractType);
      
      if (existing) {
        await base44.entities.ContractApproval.update(existing.id, {
          status: "approved",
          approved_by: currentUser.email,
          approved_date: new Date().toISOString(),
          signature: signatures[contractType] || currentUser.full_name
        });
      } else {
        await base44.entities.ContractApproval.create({
          onboarding_session_id: sessionId,
          contract_type: contractType,
          contract_content: `Standard ${contractType.replace('_', ' ')} agreement`,
          status: "approved",
          approved_by: currentUser.email,
          approved_date: new Date().toISOString(),
          signature: signatures[contractType] || currentUser.full_name
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractApprovals"] });
      toast.success("Contract approved");
    }
  });

  const isApproved = (contractType) => {
    return approvals.some(a => a.contract_type === contractType && a.status === "approved");
  };

  const allRequiredApproved = contractTypes
    .filter(c => c.required)
    .every(c => isApproved(c.key));

  return (
    <div className="space-y-6">
      <Card className="rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileSignature className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display text-primary mb-1">Contract Approvals</h3>
              <p className="text-sm text-muted-foreground">Review and sign agreements to complete your onboarding</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {contractTypes.map(contract => {
          const approved = isApproved(contract.key);
          
          return (
            <Card key={contract.key} className="rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{contract.label}</CardTitle>
                    {contract.required && <Badge variant="outline">Required</Badge>}
                  </div>
                  {approved && <CheckCircle className="h-5 w-5 text-success" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    [Contract content would be displayed here - full legal text]
                  </p>
                </div>
                
                {!approved && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Digital Signature</label>
                      <Input
                        value={signatures[contract.key] || ""}
                        onChange={(e) => setSignatures({ ...signatures, [contract.key]: e.target.value })}
                        placeholder="Type your full name to sign"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id={`agree-${contract.key}`} />
                      <label htmlFor={`agree-${contract.key}`} className="text-sm">
                        I have read and agree to the terms of this agreement
                      </label>
                    </div>
                    
                    <Button
                      onClick={() => approveMutation.mutate(contract.key)}
                      disabled={!signatures[contract.key] || approveMutation.isPending}
                      className="w-full"
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileSignature className="h-4 w-4 mr-2" />
                      )}
                      Sign & Approve
                    </Button>
                  </div>
                )}
                
                {approved && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-2 text-success text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Approved by {approvals.find(a => a.contract_type === contract.key)?.approved_by}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allRequiredApproved && (
        <Card className="rounded-xl border-success/20 bg-success/5">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Required Contracts Approved!</h3>
            <p className="text-muted-foreground">
              Your onboarding is complete and ready for deployment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}