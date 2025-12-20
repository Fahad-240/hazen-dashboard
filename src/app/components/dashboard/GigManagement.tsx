import { useState } from "react";
import { Briefcase, Eye, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DataTable } from "../shared/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const initialGigs = [
  {
    id: "G-1234",
    title: "Full Stack Developer Needed",
    poster: "TechCorp Inc.",
    budget: "$3,000 - $5,000",
    applicants: 23,
    status: "Open",
    posted: "2024-12-18",
  },
  {
    id: "G-1233",
    title: "Logo Design for Startup",
    poster: "Jane Smith",
    budget: "$500 - $800",
    applicants: 45,
    status: "In Progress",
    posted: "2024-12-15",
  },
  {
    id: "G-1232",
    title: "Content Writer for Blog",
    poster: "Marketing Pro",
    budget: "$200 - $400",
    applicants: 12,
    status: "Closed",
    posted: "2024-12-10",
  },
];

export function GigManagement() {
  const [gigs, setGigs] = useState(initialGigs);
  const [selectedGig, setSelectedGig] = useState<typeof gigs[0] | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    poster: "",
    budget: "",
    status: "Open",
  });

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Open: "bg-green-100 text-green-700",
      "In Progress": "bg-blue-100 text-blue-700",
      Closed: "bg-slate-100 text-slate-700",
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const columns = [
    {
      key: "id",
      label: "Gig ID",
      render: (gig: typeof gigs[0]) => (
        <span className="font-mono text-sm font-medium">{gig.id}</span>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (gig: typeof gigs[0]) => (
        <div>
          <p className="font-medium text-slate-900">{gig.title}</p>
          <p className="text-xs text-slate-500">by {gig.poster}</p>
        </div>
      ),
    },
    { key: "budget", label: "Budget" },
    {
      key: "applicants",
      label: "Applicants",
      render: (gig: typeof gigs[0]) => (
        <span className="font-medium text-slate-900">{gig.applicants}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (gig: typeof gigs[0]) => statusBadge(gig.status),
    },
    { key: "posted", label: "Posted" },
    {
      key: "actions",
      label: "",
      render: (gig: typeof gigs[0]) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedGig(gig)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-1">Gig Management</h1>
        <p className="text-slate-600">Monitor and manage marketplace gigs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Gigs" value="2,345" icon={Briefcase} />
        <StatCard label="Open Gigs" value="456" icon={Clock} />
        <StatCard label="Completed" value="1,789" icon={CheckCircle} />
        <StatCard label="Total Applicants" value="15,234" icon={Eye} />
      </div>

      {/* Gigs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Gigs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={gigs} />
        </CardContent>
      </Card>

      {/* Gig Detail Dialog */}
      <Dialog open={!!selectedGig} onOpenChange={() => setSelectedGig(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gig Details</DialogTitle>
          </DialogHeader>
          {selectedGig && (
            <div className="space-y-6">
              <div>
                <p className="font-mono text-sm text-slate-500">{selectedGig.id}</p>
                <h3 className="font-semibold text-slate-900 text-lg mt-1">
                  {selectedGig.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Posted by {selectedGig.poster}
                </p>
                <div className="mt-3">
                  {statusBadge(selectedGig.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-slate-600">Budget</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {selectedGig.budget}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Applicants</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {selectedGig.applicants}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Posted Date</p>
                  <p className="font-medium text-slate-900 mt-1">
                    {selectedGig.posted}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <div className="mt-1">
                    {statusBadge(selectedGig.status)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (selectedGig) {
                      setEditFormData({
                        title: selectedGig.title,
                        poster: selectedGig.poster,
                        budget: selectedGig.budget,
                        status: selectedGig.status,
                      });
                      setIsEditMode(true);
                    }
                  }}
                >
                  Edit Gig
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    if (selectedGig) {
                      if (selectedGig.status === "Closed") {
                        const confirmed = window.confirm(
                          `Are you sure you want to reopen gig ${selectedGig.id}?`
                        );
                        if (confirmed) {
                          setGigs((prevGigs) =>
                            prevGigs.map((gig) =>
                              gig.id === selectedGig.id
                                ? { ...gig, status: "Open" }
                                : gig
                            )
                          );
                          setSelectedGig({ ...selectedGig, status: "Open" });
                          alert(`Gig ${selectedGig.id} has been reopened.`);
                        }
                      } else {
                        const confirmed = window.confirm(
                          `Are you sure you want to close gig ${selectedGig.id}?`
                        );
                        if (confirmed) {
                          setGigs((prevGigs) =>
                            prevGigs.map((gig) =>
                              gig.id === selectedGig.id
                                ? { ...gig, status: "Closed" }
                                : gig
                            )
                          );
                          setSelectedGig({ ...selectedGig, status: "Closed" });
                          console.log("Close gig:", selectedGig.id);
                          alert(`Gig ${selectedGig.id} has been closed.`);
                        }
                      }
                    }
                  }}
                >
                  {selectedGig?.status === "Closed" ? "Reopen Gig" : "Close Gig"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Gig Dialog */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Gig</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Gig Title</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                placeholder="Enter gig title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-poster">Posted By</Label>
              <Input
                id="edit-poster"
                value={editFormData.poster}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, poster: e.target.value })
                }
                placeholder="Enter poster name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-budget">Budget</Label>
              <Input
                id="edit-budget"
                value={editFormData.budget}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, budget: e.target.value })
                }
                placeholder="e.g., $3,000 - $5,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, status: value })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsEditMode(false);
                  setEditFormData({
                    title: "",
                    poster: "",
                    budget: "",
                    status: "Open",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => {
                  if (selectedGig) {
                    // Update gig in state
                    setGigs((prevGigs) =>
                      prevGigs.map((gig) =>
                        gig.id === selectedGig.id
                          ? {
                              ...gig,
                              title: editFormData.title,
                              poster: editFormData.poster,
                              budget: editFormData.budget,
                              status: editFormData.status,
                            }
                          : gig
                      )
                    );
                    // Update selected gig
                    setSelectedGig({
                      ...selectedGig,
                      title: editFormData.title,
                      poster: editFormData.poster,
                      budget: editFormData.budget,
                      status: editFormData.status,
                    });
                    setIsEditMode(false);
                    alert("Gig details updated successfully!");
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
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
