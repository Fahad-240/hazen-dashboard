import { useState } from "react";
import { Flag, Check, X, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DataTable } from "../shared/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export function ContentModeration() {
  const [flaggedContent, setFlaggedContent] = useState<Array<{
    id: string;
    type: string;
    user: string;
    reason: string;
    reporter: string;
    status: string;
    date: string;
  }>>([]);
  const [selectedFlag, setSelectedFlag] = useState<typeof flaggedContent[0] | null>(null);

  const typeBadge = (type: string) => {
    const variants: Record<string, string> = {
      Profile: "bg-blue-100 text-blue-700",
      "Gig Posting": "bg-purple-100 text-purple-700",
      "Deal Message": "bg-green-100 text-green-700",
    };
    return <Badge className={variants[type]}>{type}</Badge>;
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-700",
      "Under Review": "bg-blue-100 text-blue-700",
      Resolved: "bg-green-100 text-green-700",
      Dismissed: "bg-slate-100 text-slate-700",
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const columns = [
    {
      key: "id",
      label: "Flag ID",
      render: (item: typeof flaggedContent[0]) => (
        <span className="font-mono text-sm font-medium">{item.id}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (item: typeof flaggedContent[0]) => typeBadge(item.type),
    },
    { key: "user", label: "Flagged User" },
    { key: "reason", label: "Reason" },
    { key: "reporter", label: "Reporter" },
    {
      key: "status",
      label: "Status",
      render: (item: typeof flaggedContent[0]) => statusBadge(item.status),
    },
    { key: "date", label: "Date" },
    {
      key: "actions",
      label: "Actions",
      render: (item: typeof flaggedContent[0]) => (
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="View"
            onClick={() => setSelectedFlag(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Resolve"
            onClick={() => {
              const confirmed = window.confirm(
                `Are you sure you want to resolve flag ${item.id}?`
              );
              if (confirmed) {
                setFlaggedContent((prev) =>
                  prev.map((flag) =>
                    flag.id === item.id ? { ...flag, status: "Resolved" } : flag
                  )
                );
                alert(`Flag ${item.id} has been resolved.`);
              }
            }}
            disabled={item.status === "Resolved" || item.status === "Dismissed"}
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Dismiss"
            onClick={() => {
              const confirmed = window.confirm(
                `Are you sure you want to dismiss flag ${item.id}?`
              );
              if (confirmed) {
                setFlaggedContent((prev) =>
                  prev.map((flag) =>
                    flag.id === item.id ? { ...flag, status: "Dismissed" } : flag
                  )
                );
                alert(`Flag ${item.id} has been dismissed.`);
              }
            }}
            disabled={item.status === "Resolved" || item.status === "Dismissed"}
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-1">Content Moderation</h1>
        <p className="text-slate-600">Review and moderate flagged content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Flags" value="234" icon={Flag} />
        <StatCard label="Pending Review" value="45" icon={Eye} />
        <StatCard label="Resolved" value="167" icon={Check} />
        <StatCard label="Dismissed" value="22" icon={X} />
      </div>

      {/* Flagged Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Content</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={flaggedContent} />
        </CardContent>
      </Card>

      {/* Flag Details Dialog */}
      <Dialog open={!!selectedFlag} onOpenChange={() => setSelectedFlag(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Flag Details</DialogTitle>
          </DialogHeader>
          {selectedFlag && (
            <div className="space-y-6">
              <div>
                <p className="font-mono text-sm text-slate-500">{selectedFlag.id}</p>
                <h3 className="font-semibold text-slate-900 text-lg mt-1">
                  Flagged Content Review
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-slate-600">Type</p>
                  <div className="mt-1">
                    {typeBadge(selectedFlag.type)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <div className="mt-1">
                    {statusBadge(selectedFlag.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Flagged User</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {selectedFlag.user}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Reporter</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {selectedFlag.reporter}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Reason</p>
                  <p className="font-medium text-slate-900 mt-1">
                    {selectedFlag.reason}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date Flagged</p>
                  <p className="font-medium text-slate-900 mt-1">
                    {selectedFlag.date}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedFlag(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="default"
                  className="flex-1"
                  onClick={() => {
                    if (selectedFlag.status !== "Resolved") {
                      const confirmed = window.confirm(
                        `Are you sure you want to resolve flag ${selectedFlag.id}?`
                      );
                      if (confirmed) {
                        setFlaggedContent((prev) =>
                          prev.map((flag) =>
                            flag.id === selectedFlag.id
                              ? { ...flag, status: "Resolved" }
                              : flag
                          )
                        );
                        setSelectedFlag({ ...selectedFlag, status: "Resolved" });
                        alert(`Flag ${selectedFlag.id} has been resolved.`);
                      }
                    }
                  }}
                  disabled={selectedFlag.status === "Resolved" || selectedFlag.status === "Dismissed"}
                >
                  Resolve Flag
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    if (selectedFlag.status !== "Dismissed") {
                      const confirmed = window.confirm(
                        `Are you sure you want to dismiss flag ${selectedFlag.id}?`
                      );
                      if (confirmed) {
                        setFlaggedContent((prev) =>
                          prev.map((flag) =>
                            flag.id === selectedFlag.id
                              ? { ...flag, status: "Dismissed" }
                              : flag
                          )
                        );
                        setSelectedFlag({ ...selectedFlag, status: "Dismissed" });
                        alert(`Flag ${selectedFlag.id} has been dismissed.`);
                      }
                    }
                  }}
                  disabled={selectedFlag.status === "Resolved" || selectedFlag.status === "Dismissed"}
                >
                  Dismiss Flag
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-slate-900 mt-1">{value}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
