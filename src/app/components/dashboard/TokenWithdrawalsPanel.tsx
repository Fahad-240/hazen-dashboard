import { useState } from "react";
import { Wallet, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner";

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  walletAddress: string;
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: string;
  transactionHash?: string;
  failureReason?: string;
}

export function TokenWithdrawalsPanel() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending" || w.status === "processing");

  const handleApprove = async () => {
    if (!selectedWithdrawal || !transactionHash.trim()) {
      toast.error("Please enter the transaction hash");
      return;
    }

    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === selectedWithdrawal.id
          ? { ...w, status: "completed" as const, transactionHash: transactionHash.trim() }
          : w
      )
    );

    setIsProcessing(false);
    setIsApproveDialogOpen(false);
    setSelectedWithdrawal(null);
    setTransactionHash("");
    toast.success("Withdrawal approved and processed successfully");
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !failureReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === selectedWithdrawal.id
          ? { ...w, status: "failed" as const, failureReason: failureReason.trim() }
          : w
      )
    );

    setIsProcessing(false);
    setIsRejectDialogOpen(false);
    setSelectedWithdrawal(null);
    setFailureReason("");
    toast.success("Withdrawal rejected. Tokens returned to user.");
  };

  const openApproveDialog = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setTransactionHash("");
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setFailureReason("");
    setIsRejectDialogOpen(true);
  };

  const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-1">Token Withdrawals</h1>
        <p className="text-slate-600">Process IMPACT token withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Requests</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {pendingWithdrawals.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-700">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Amount</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {totalPendingAmount.toFixed(2)} IMPACT
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawals List */}
      {pendingWithdrawals.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-12">
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-900">No pending withdrawals</p>
              <p className="text-sm text-slate-600 mt-1">
                All withdrawal requests have been processed
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pending Withdrawals</CardTitle>
            <CardDescription>Review and process withdrawal requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="border border-slate-200 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{withdrawal.userName}</h3>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Clock className="h-3 w-3 mr-1" />
                          {withdrawal.status === "pending" ? "Pending" : "Processing"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{withdrawal.userEmail}</p>
                      <p className="text-lg font-semibold text-slate-900 mt-2">
                        {withdrawal.amount.toFixed(2)} IMPACT
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Requested {new Date(withdrawal.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Wallet Address</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                      <code className="text-xs font-mono text-slate-700 flex-1">
                        {withdrawal.walletAddress}
                      </code>
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => openApproveDialog(withdrawal)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => openRejectDialog(withdrawal)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex gap-3">
              <span className="font-semibold text-slate-900">1.</span>
              <span>Review the withdrawal request and verify the wallet address</span>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold text-slate-900">2.</span>
              <span>
                Send the exact amount of IMPACT tokens to the user wallet address using your admin
                wallet
              </span>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold text-slate-900">3.</span>
              <span>
                Copy the blockchain transaction hash and paste it in the approval form
              </span>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold text-slate-900">4.</span>
              <span>Click Approve to complete the withdrawal and notify the user</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
            <DialogDescription>
              Enter the transaction hash after sending {selectedWithdrawal?.amount.toFixed(2)} IMPACT
              to the user wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="txHash">Transaction Hash *</Label>
              <Input
                id="txHash"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="0x..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                Enter the blockchain transaction hash from your admin wallet
              </p>
            </div>
            {selectedWithdrawal && (
              <div className="rounded-md bg-slate-50 p-3 space-y-1">
                <p className="text-xs font-medium text-slate-700">Wallet Address:</p>
                <code className="text-xs text-slate-600">{selectedWithdrawal.walletAddress}</code>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isProcessing || !transactionHash.trim()}>
              <Save className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Approve & Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection. Tokens will be returned to the user wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rejection *</Label>
              <textarea
                id="reason"
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-slate-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              <p className="text-xs text-slate-500">
                The user will be notified with this reason
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing || !failureReason.trim()}
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Reject & Return Tokens"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

