import { useState, useEffect } from "react";
import { Briefcase, Eye, CheckCircle, Clock, Search, Filter, RefreshCw, Trash2, Flag } from "lucide-react";
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
import { getGigsList, updateGigStatus, getGigById, deleteGig, flagGig, Gig } from "../../services/api";
import { toast } from "sonner";

export function GigManagement() {
  const { permissions } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"open" | "in_progress" | "completed" | "cancelled" | "all">("all");
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

  // Fetch full gig details when a gig is selected
  useEffect(() => {
    if (selectedGig) {
      fetchGigDetails(selectedGig.id);
    }
  }, [selectedGig?.id]);

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
        status?: "open" | "in_progress" | "completed" | "cancelled";
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

  const fetchGigDetails = async (gigId: string) => {
    try {
      const response = await getGigById(gigId);
      
      if (response.success && response.data?.gig) {
        setSelectedGig(response.data.gig);
      } else {
        console.error("Failed to fetch gig details:", response.error);
      }
    } catch (error) {
      console.error("Error fetching gig details:", error);
    }
  };

  const handleStatusUpdate = async (gigId: string, newStatus: "open" | "in_progress" | "completed" | "cancelled") => {
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

  const handleDeleteGig = async (gigId: string) => {
    if (!permissions.manage_gigs) {
      toast.error("You don't have permission to delete gigs");
      return;
    }

    if (!window.confirm("Kya aap is gig ko permanently delete karna chahte hain? Yeh action undo nahi ho sakta.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await deleteGig(gigId);

      if (response.success) {
        toast.success(response.message || "Gig deleted successfully");
        
        // Remove gig from local state
        setGigs((prevGigs) => prevGigs.filter((gig) => gig.id !== gigId));
        
        // Close modal if deleted gig was selected
        if (selectedGig && selectedGig.id === gigId) {
          setSelectedGig(null);
        }
        
        // Refresh gigs list
        fetchGigs();
      } else {
        toast.error(response.error || "Failed to delete gig");
      }
    } catch (error) {
      console.error("Error deleting gig:", error);
      toast.error("Failed to delete gig. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFlagGig = async (gigId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for flagging this gig");
      return;
    }

    // Get gig title for confirmation message
    const gigTitle = selectedGig?.title || gigs.find(g => g.id === gigId)?.title || "Gig";

    setIsFlagging(true);
    try {
      const response = await flagGig(gigId, reason.trim());

      if (response.success) {
        toast.success(`"${gigTitle}" has been flagged successfully. Reason: ${reason.trim()}`, {
          duration: 5000,
        });
        setShowFlagModal(false);
        setFlagReason("");
        
        // Refresh gig details to show flagged status
        if (selectedGig && selectedGig.id === gigId) {
          fetchGigDetails(gigId);
        }
        
        // Refresh gigs list
        fetchGigs();
      } else {
        toast.error(response.error || "Failed to flag gig");
      }
    } catch (error) {
      console.error("Error flagging gig:", error);
      toast.error("Failed to flag gig. Please try again.");
    } finally {
      setIsFlagging(false);
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      open: "bg-blue-100 text-blue-700 border-blue-200",
      in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
      completed: "bg-green-100 text-green-700 border-green-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      // Legacy support
      active: "bg-green-100 text-green-700 border-green-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      closed: "bg-slate-100 text-slate-700 border-slate-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    const displayStatus = 
      status === "open" ? "Open" : 
      status === "in_progress" ? "In Progress" :
      status === "completed" ? "Completed" : 
      status === "cancelled" ? "Cancelled" :
      // Legacy support
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
    open: gigs.filter((g) => g.status === "open").length,
    in_progress: gigs.filter((g) => g.status === "in_progress").length,
    completed: gigs.filter((g) => g.status === "completed").length,
    cancelled: gigs.filter((g) => g.status === "cancelled").length,
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

  const formatPrice = (price: number | string | undefined) => {
    if (!price) return "-";
    if (typeof price === "string") {
      // If it's already formatted as string, return as is
      if (price.includes("$")) return price;
      // Try to parse if it's a number string
      const numPrice = parseFloat(price);
      if (!isNaN(numPrice)) {
        return `$${numPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return price;
    }
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (gig: Gig) => (
        <div className="flex items-start gap-2">
          <div className="flex-1">
          <p className="font-medium text-slate-900">{gig.title || "Untitled Gig"}</p>
          {gig.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {gig.description}
            </p>
          )}
        </div>
          {(gig as any).flagged && (
            <div title="Flagged">
              <Flag className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (gig: Gig) => (
        <span className="text-sm font-medium text-slate-900">
          {formatPrice(gig.price)}
        </span>
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
        <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedGig(gig)}
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
          {permissions.manage_gigs && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteGig(gig.id)}
              disabled={isDeleting}
              title="Delete Gig"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
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
          label="Open Gigs" 
          value={stats.open.toString()} 
          icon={Eye} 
          color="blue"
        />
        <StatCard 
          label="In Progress" 
          value={stats.in_progress.toString()} 
          icon={Clock} 
          color="yellow"
        />
        <StatCard 
          label="Completed" 
          value={stats.completed.toString()} 
          icon={CheckCircle} 
          color="green"
        />
        <StatCard 
          label="Cancelled" 
          value={stats.cancelled.toString()} 
          icon={CheckCircle} 
          color="slate"
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
                onValueChange={(value: "open" | "in_progress" | "completed" | "cancelled" | "all") => {
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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

              {/* Flagged Status */}
              {(selectedGig as any).flagged && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900">This gig has been flagged</p>
                      {(selectedGig as any).flagged_reason && (
                        <p className="text-xs text-orange-700 mt-1">
                          Reason: {(selectedGig as any).flagged_reason}
                        </p>
                      )}
                      {(selectedGig as any).flagged_at && (
                        <p className="text-xs text-orange-600 mt-1">
                          Flagged on: {formatLongDate((selectedGig as any).flagged_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                {selectedGig.price && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Price</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatPrice(selectedGig.price)}
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Information - Only important fields */}
              {(() => {
                const importantFields: Array<{ key: string; label: string; value: any }> = [];
                
                // Budget
                if (selectedGig.budget_min || selectedGig.budget_max) {
                  const budget = selectedGig.budget_min && selectedGig.budget_max
                    ? `$${selectedGig.budget_min.toLocaleString()} - $${selectedGig.budget_max.toLocaleString()}`
                    : selectedGig.budget_min
                    ? `Min: $${selectedGig.budget_min.toLocaleString()}`
                    : `Max: $${selectedGig.budget_max.toLocaleString()}`;
                  importantFields.push({ key: "budget", label: "Budget", value: budget });
                }
                
                // Categories
                if (selectedGig.categories && Array.isArray(selectedGig.categories) && selectedGig.categories.length > 0) {
                  importantFields.push({ key: "categories", label: "Categories", value: selectedGig.categories.join(", ") });
                }
                
                // Location
                if (selectedGig.location) {
                  importantFields.push({ key: "location", label: "Location", value: selectedGig.location });
                }
                
                // Deadline
                if (selectedGig.deadline) {
                  importantFields.push({ key: "deadline", label: "Deadline", value: formatLongDate(selectedGig.deadline) });
                }
                
                // Deliverables
                if (selectedGig.deliverables && Array.isArray(selectedGig.deliverables) && selectedGig.deliverables.length > 0) {
                  importantFields.push({ key: "deliverables", label: "Deliverables", value: selectedGig.deliverables.join(", ") });
                }
                
                // Influencer Types
                if (selectedGig.influencer_types && Array.isArray(selectedGig.influencer_types) && selectedGig.influencer_types.length > 0) {
                  importantFields.push({ key: "influencer_types", label: "Influencer Types", value: selectedGig.influencer_types.join(", ") });
                }
                
                if (importantFields.length === 0) return null;
                
                return (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-slate-600 mb-3">Additional Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {importantFields.map((field) => (
                        <div key={field.key}>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{field.label}</p>
                          <p className="text-sm font-semibold text-slate-900">{field.value}</p>
                        </div>
                      ))}
                  </div>
                </div>
                );
              })()}

              {/* Status Update Actions - Only for admins with manage_gigs permission */}
              {permissions.manage_gigs && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-slate-600 mb-3">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {/* Approve Button - Only show when status is open */}
                    {selectedGig.status === "open" && (
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to approve gig ${truncateId(selectedGig.id)}?`)) {
                            handleStatusUpdate(selectedGig.id, "in_progress");
                          }
                        }}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? "Updating..." : "Approve Gig"}
                      </Button>
                    )}

                    {/* Unapprove Button - Show when status is in_progress */}
                    {selectedGig.status === "in_progress" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to unapprove gig ${truncateId(selectedGig.id)}?`)) {
                            handleStatusUpdate(selectedGig.id, "open");
                          }
                        }}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? "Updating..." : "Unapprove Gig"}
                      </Button>
                    )}

                    {/* Cancel Button - Show when status is not cancelled */}
                    {selectedGig.status !== "cancelled" && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to cancel gig ${truncateId(selectedGig.id)}?`)) {
                            handleStatusUpdate(selectedGig.id, "cancelled");
                          }
                        }}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? "Updating..." : "Cancel Gig"}
                      </Button>
                    )}

                    {/* Uncancel Button - Show when status is cancelled */}
                    {selectedGig.status === "cancelled" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to uncancel gig ${truncateId(selectedGig.id)}?`)) {
                            handleStatusUpdate(selectedGig.id, "open");
                          }
                        }}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? "Updating..." : "Uncancel Gig"}
                      </Button>
                    )}

                    {/* Flag Gig Button */}
                    {permissions.moderate_content && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`${
                          (selectedGig as any).flagged
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-orange-300 text-orange-700 hover:bg-orange-50"
                        }`}
                        onClick={() => setShowFlagModal(true)}
                        disabled={isFlagging || (selectedGig as any).flagged}
                        title={(selectedGig as any).flagged ? "This gig is already flagged" : "Flag this gig"}
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        {(selectedGig as any).flagged ? "Already Flagged" : isFlagging ? "Flagging..." : "Flag Gig"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Flag Reason Dialog */}
      <Dialog open={showFlagModal} onOpenChange={setShowFlagModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Flag Gig</DialogTitle>
            <DialogDescription>
              Please provide a reason for flagging this gig. This will mark it for review in the Content Moderation section.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="flagReason" className="text-sm font-medium text-slate-700 mb-2 block">
                Reason
              </label>
              <textarea
                id="flagReason"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="e.g., Inappropriate content, Spam, Policy violation, Suspicious activity..."
                className="w-full min-h-[100px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={isFlagging}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowFlagModal(false);
                  setFlagReason("");
                }}
                disabled={isFlagging}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  if (selectedGig) {
                    handleFlagGig(selectedGig.id, flagReason);
                  }
                }}
                disabled={isFlagging || !flagReason.trim()}
              >
                {isFlagging ? "Flagging..." : "Flag Gig"}
              </Button>
            </div>
          </div>
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
