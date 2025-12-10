import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, CheckCircle, PartyPopper } from "lucide-react";
import { toast } from "sonner";

const CONTRACT_TYPES = [
  { key: "master_agreement", label: "Master Service Agreement", required: true },
  { key: "sla", label: "Service Level Agreement", required: true },
  { key: "dr_policy", label: "Disaster Recovery Policy", required: true },
  { key: "support_terms", label: "Support Terms", required: true },
  { key: "privacy_policy", label: "Privacy Policy", required: true },
  { key: "data_processing", label: "Data Processing Agreement", required: false }
];

export default function ContractApprovalFlow({ sessionId, currentUser }) {
  const queryClient = useQueryClient();
  const [selectedContract, setSelectedContract] = useState(null);
  const [signature, setSignature] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);

  const { data: contracts = [] } = useQuery({
    queryKey: ["contractApprovals", sessionId],
    queryFn: () => base44.entities.ContractApproval.filter({ onboarding_session_id: sessionId }),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ contractType }) => {
      const existing = contracts.find(c => c.contract_type === contractType);
      if (existing) {
        return await base44.entities.ContractApproval.update(existing.id, {
          status: "approved",
          approved_by: currentUser.email,
          approved_date: new Date().toISOString(),
          signature
        });
      } else {
        return await base44.entities.ContractApproval.create({
          onboarding_session_id: sessionId,
          contract_type: contractType,
          status: "approved",
          approved_by: currentUser.email,
          approved_date: new Date().toISOString(),
          signature
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractApprovals"] });
      toast.success("Contract approved");
      setSelectedContract(null);
      setSignature("");
      setConfirmChecked(false);
    }
  });

  const getContractStatus = (contractType) => {
    const contract = contracts.find(c => c.contract_type === contractType);
    return contract?.status || "pending_review";
  };

  const requiredContracts = CONTRACT_TYPES.filter(c => c.required);
  const approvedRequired = requiredContracts.filter(c => 
    getContractStatus(c.key) === "approved"
  ).length;
  const allRequiredApproved = approvedRequired === requiredContracts.length;

  return (
    <div className="space-y-6">
      <Card className="rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display text-primary mb-1">Contract Approvals</h3>
              <p className="text-sm text-muted-foreground">
                Review and approve required agreements ({approvedRequired}/{requiredContracts.length} completed)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {allRequiredApproved && (
        <Card className="rounded-xl bg-success/5 border-success/20">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3 text-success">
              <PartyPopper className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">All Required Contracts Approved!</h3>
                <p className="text-sm text-muted-foreground">Your application is ready for implementation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {CONTRACT_TYPES.map(contract => {
          const status = getContractStatus(contract.key);
          const isApproved = status === "approved";
          const isSelected = selectedContract === contract.key;

          return (
            <Card key={contract.key} className={`rounded-xl ${isApproved ? "border-success/30" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{contract.label}</CardTitle>
                    {contract.required && <Badge variant="outline">Required</Badge>}
                  </div>
                  {isApproved ? (
                    <Badge className="bg-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedContract(isSelected ? null : contract.key)}
                    >
                      {isSelected ? "Cancel" : "Review & Sign"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              {isSelected && !isApproved && (
                <CardContent className="space-y-4 border-t pt-4">
                  <div className="p-4 bg-muted rounded-lg max-h-64 overflow-y-auto">
                    <h4 className="font-semibold mb-2">{contract.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      [Contract content would be displayed here. This is a placeholder for the actual legal agreement.]
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Checkbox 
                        checked={confirmChecked}
                        onCheckedChange={setConfirmChecked}
                        id={`confirm-${contract.key}`}
                      />
                      <label 
                        htmlFor={`confirm-${contract.key}`}
                        className="text-sm cursor-pointer"
                      >
                        I have read and agree to the terms of this agreement
                      </label>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Digital Signature</label>
                      <Input
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        placeholder="Type your full name to sign"
                        className="mt-1"
                      />
                    </div>

                    <Button
                      onClick={() => approveMutation.mutate({ contractType: contract.key })}
                      disabled={!confirmChecked || !signature.trim() || approveMutation.isPending}
                      className="w-full"
                    >
                      Approve and Sign
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}