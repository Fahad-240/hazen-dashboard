import { useState, useEffect } from "react";
import { Briefcase, Eye, CheckCircle, Clock, Search, Filter, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  DialogDescription,
} from "../ui/dialog";
import { useAuth } from "../../context/AuthContext";
import { getGigsList, updateGigStatus, Gig } from "../../services/api";
import { toast } from "sonner";

export function GigManagement() {
  const { permissions } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "closed" | "pending" | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch gigs on component mount and when filters change
  useEffect(() => {
    fetchGigs();
  }, [currentPage, statusFilter]);

  const fetchGigs = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const params: {
        page?: number;
        limit?: number;
        status?: "active" | "closed" | "pending";
      } = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await getGigsList(params);

      if (response.success && response.data?.gigs) {
        setGigs(response.data.gigs);
        setPagination(
          response.data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          }
        );
      } else {
        toast.error(response.error || "Failed to fetch gigs");
        setGigs([]);
      }
    } catch (error) {
      console.error("Error fetching gigs:", error);
      toast.error("Failed to fetch gigs");
      setGigs([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleStatusUpdate = async (gigId: string, newStatus: "approved" | "rejected" | "closed") => {
    if (!permissions.manage_gigs) {
      toast.error("You don't have permission to update gig status");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const response = await updateGigStatus(gigId, newStatus);

      if (response.success && response.data?.gig) {
        // Update gig in local state
        setGigs((prevGigs) =>
          prevGigs.map((gig) =>
            gig.id === gigId
              ? { ...gig, status: response.data!.gig.status as any }
              : gig
          )
        );

        // Update selected gig if it's the one being updated
        if (selectedGig && selectedGig.id === gigId) {
          setSelectedGig({ ...selectedGig, status: response.data!.gig.status as any });
        }

        toast.success(response.message || "Gig status updated successfully");
      } else {
        toast.error(response.error || "Failed to update gig status");
      }
    } catch (error) {
      console.error("Error updating gig status:", error);
      toast.error("Failed to update gig status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-700 border-green-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      closed: "bg-slate-100 text-slate-700 border-slate-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    const displayStatus = 
      status === "active" ? "Active" : 
      status === "approved" ? "Approved" :
      status === "closed" ? "Closed" : 
      status === "pending" ? "Pending" :
      status === "rejected" ? "Rejected" :
      status;
    return (
      <Badge 
        variant="outline" 
        className={variants[status] || "bg-slate-100 text-slate-700 border-slate-200"}
      >
        {displayStatus}
      </Badge>
    );
  };

  // Filter gigs based on search query (client-side filtering)
  const filteredGigs = gigs.filter((gig) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      gig.title?.toLowerCase().includes(query) ||
      gig.description?.toLowerCase().includes(query) ||
      gig.id?.toLowerCase().includes(query)
    );
  });

  // Calculate stats from pagination (server-side total)
  const stats = {
    total: pagination.total || 0,
    active: gigs.filter((g) => g.status === "active" || g.status === "approved").length,
    closed: gigs.filter((g) => g.status === "closed").length,
    pending: gigs.filter((g) => g.status === "pending").length,
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatLongDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const truncateId = (id: string) => {
    if (id.length > 12) {
      return `${id.substring(0, 8)}...`;
    }
    return id;
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (gig: Gig) => (
        <div>
          <p className="font-medium text-slate-900">{gig.title || "Untitled Gig"}</p>
          {gig.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {gig.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (gig: Gig) => statusBadge(gig.status),
    },
    {
      key: "created_at",
      label: "Date",
      render: (gig: Gig) => (
        <span className="text-sm text-slate-600">{formatDate(gig.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (gig: Gig) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedGig(gig)}
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-1">Gig Management</h1>
          <p className="text-slate-600">Monitor and manage marketplace gigs</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchGigs(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Gigs" 
          value={stats.total.toLocaleString()} 
          icon={Briefcase} 
        />
        <StatCard 
          label="Active Gigs" 
          value={stats.active.toString()} 
          icon={Clock} 
          color="green"
        />
        <StatCard 
          label="Closed Gigs" 
          value={stats.closed.toString()} 
          icon={CheckCircle} 
          color="slate"
        />
        <StatCard 
          label="Pending Gigs" 
          value={stats.pending.toString()} 
          icon={Eye} 
          color="yellow"
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Gigs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search gigs by title, description, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onValueChange={(value: "active" | "closed" | "pending" | "all") => {
                  setStatusFilter(value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Gigs Table */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-3"></div>
              <div className="text-slate-500">Loading gigs...</div>
            </div>
          ) : filteredGigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-slate-300 mb-3" />
              <div className="text-slate-500 font-medium mb-1">No gigs found</div>
              <div className="text-sm text-slate-400">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : statusFilter !== "all"
                  ? `No ${statusFilter} gigs available`
                  : "No gigs available at the moment"}
              </div>
            </div>
          ) : (
            <>
              <DataTable columns={columns} data={filteredGigs} />
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-slate-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total.toLocaleString()} gigs
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || isLoading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage >= pagination.totalPages || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Gig Detail Dialog */}
      <Dialog open={!!selectedGig} onOpenChange={() => setSelectedGig(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gig Details</DialogTitle>
            <DialogDescription>
              View gig information
            </DialogDescription>
          </DialogHeader>
          {selectedGig && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">
                  {selectedGig.title || "Untitled Gig"}
                </h3>
                {selectedGig.description && (
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    {selectedGig.description}
                  </p>
                )}
                <div className="mt-4">
                  {statusBadge(selectedGig.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Status</p>
                  <div>
                    {statusBadge(selectedGig.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Date</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatLongDate(selectedGig.created_at)}
                  </p>
                </div>
              </div>

              {/* Additional fields if available */}
              {Object.keys(selectedGig).length > 4 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-slate-600 mb-3">Additional Information</p>
                  <div className="space-y-2">
                    {Object.entries(selectedGig)
                      .filter(([key]) => !["id", "title", "description", "status", "created_at"].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-slate-600 capitalize">
                            {key.replace(/_/g, " ")}:
                          </span>
                          <span className="text-slate-900 font-medium">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Status Update Actions - Only for admins with manage_gigs permission */}
              {permissions.manage_gigs && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-slate-600 mb-3">Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {/* Close/Unclose Button */}
                    {selectedGig.status === "closed" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to unclose gig ${truncateId(selectedGig.id)}?`)) {
                            handleStatusUpdate(selectedGig.id, "approved");
                          }
                        }}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? "Updating..." : "Unclose Gig"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to close gig ${truncateId(selectedGig.id)}?`)) {
                            handleStatusUpdate(selectedGig.id, "closed");
                          }
                        }}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? "Updating..." : "Close Gig"}
                      </Button>
                    )}

                    {/* Reject/Unreject Button */}
                    {selectedGig.status === "rejected" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to unreject gig ${truncateId(selectedGig.id)}?`)) {
                            handleStatusUpdate(selectedGig.id, "approved");
                          }
                        }}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? "Updating..." : "Unreject Gig"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to reject gig ${truncateId(selectedGig.id)}?`)) {
                            handleStatusUpdate(selectedGig.id, "rejected");
                          }
                        }}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? "Updating..." : "Reject Gig"}
                      </Button>
                    )}

                    {/* Approve/Unapprove Button */}
                    {selectedGig.status === "approved" || selectedGig.status === "active" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to unapprove gig ${truncateId(selectedGig.id)}?`)) {
                            handleStatusUpdate(selectedGig.id, "rejected");
                          }
                        }}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? "Updating..." : "Unapprove Gig"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to approve gig ${truncateId(selectedGig.id)}?`)) {
                            handleStatusUpdate(selectedGig.id, "approved");
                          }
                        }}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? "Updating..." : "Approve Gig"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon,
  color = "slate"
}: { 
  label: string; 
  value: string; 
  icon: any;
  color?: "green" | "slate" | "yellow" | "blue";
}) {
  const colorClasses = {
    green: "bg-green-100 text-green-700",
    slate: "bg-slate-100 text-slate-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-slate-900 mt-1 text-2xl font-semibold">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
