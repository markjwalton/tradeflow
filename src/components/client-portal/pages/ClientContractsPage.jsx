import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, PartyPopper } from "lucide-react";
import { toast } from "sonner";

const CONTRACT_TYPES = [
  { key: "master_agreement", label: "Master Service Agreement", required: true },
  { key: "sla", label: "Service Level Agreement", required: true },
  { key: "dr_policy", label: "Disaster Recovery Policy", required: true },
  { key: "support_terms", label: "Support Terms", required: true },
  { key: "privacy_policy", label: "Privacy Policy", required: true },
  { key: "data_processing", label: "Data Processing Agreement", required: false }
];

export function ClientContractsPage({ sessionId, currentUser }) {
  const queryClient = useQueryClient();
  const [selectedContract, setSelectedContract] = useState(null);
  const [signature, setSignature] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const { data: contracts = [] } = useQuery({
    queryKey: ["clientContracts", sessionId],
    queryFn: () => base44.entities.ContractApproval.filter({ onboarding_session_id: sessionId }),
  });

  const approveMutation = useMutation({
    mutationFn: async (contractType) => {
      const existing = contracts.find(c => c.contract_type === contractType);
      if (existing) {
        return await base44.entities.ContractApproval.update(existing.id, {
          status: "approved",
          approved_by: currentUser?.email,
          approved_date: new Date().toISOString(),
          signature
        });
      } else {
        return await base44.entities.ContractApproval.create({
          onboarding_session_id: sessionId,
          contract_type: contractType,
          status: "approved",
          approved_by: currentUser?.email,
          approved_date: new Date().toISOString(),
          signature
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["clientContracts"]);
      toast.success("Contract approved");
      setSelectedContract(null);
      setSignature("");
      setConfirmed(false);
    },
  });

  function getStatus(key) {
    return contracts.find(c => c.contract_type === key)?.status || "pending_review";
  }

  const required = CONTRACT_TYPES.filter(c => c.required);
  const approvedCount = required.filter(c => getStatus(c.key) === "approved").length;
  const allApproved = approvedCount === required.length;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-base font-semibold text-slate-50">Contracts</h1>
        <p className="mt-1 text-xs text-slate-400">
          Review and approve agreements ({approvedCount}/{required.length} completed)
        </p>
      </section>

      {allApproved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-5">
          <div className="flex items-center gap-3 text-emerald-400">
            <PartyPopper className="h-6 w-6" />
            <div>
              <h3 className="text-sm font-semibold">All Contracts Approved!</h3>
              <p className="text-xs text-slate-400">Ready for implementation</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {CONTRACT_TYPES.map(contract => {
          const status = getStatus(contract.key);
          const approved = status === "approved";
          const selected = selectedContract === contract.key;

          return (
            <div key={contract.key} className={`rounded-xl border ${approved ? "border-emerald-500/30" : "border-slate-800"} bg-slate-900/40 p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-slate-100">{contract.label}</h3>
                  {contract.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                </div>
                {approved ? (
                  <Badge className="bg-emerald-950/40 text-emerald-400 border-emerald-500/30">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Approved
                  </Badge>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedContract(selected ? null : contract.key)}
                  >
                    {selected ? "Cancel" : "Review & Sign"}
                  </Button>
                )}
              </div>

              {selected && !approved && (
                <div className="space-y-4 border-t border-slate-800 pt-4">
                  <div className="max-h-64 overflow-y-auto rounded-lg bg-slate-950/60 p-4 text-xs text-slate-300">
                    [Contract content for {contract.label} would be displayed here.]
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      checked={confirmed}
                      onCheckedChange={setConfirmed}
                      id={`confirm-${contract.key}`}
                    />
                    <label htmlFor={`confirm-${contract.key}`} className="text-xs text-slate-300 cursor-pointer">
                      I have read and agree to the terms
                    </label>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300">Digital Signature</label>
                    <Input
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="Type your full name"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <Button
                    onClick={() => approveMutation.mutate(contract.key)}
                    disabled={!confirmed || !signature.trim()}
                    className="w-full"
                  >
                    Approve and Sign
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}