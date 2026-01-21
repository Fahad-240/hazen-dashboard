import { useState, useEffect, useMemo } from "react";
import { DollarSign, Eye, Lock, Unlock, AlertTriangle, CheckCircle, RefreshCw, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { DataTable } from "../shared/DataTable";
import { useAuth } from "../../context/AuthContext";
import {
  getEscrowJobs,
  getEscrowJobById,
  updateEscrowStatus,
  disputeEscrowJob,
  resolveEscrowDispute,
  getAllDisputes,
  resolveDispute,
  EscrowJob,
  Dispute,
} from "../../services/api";
import { toast } from "sonner";

export function FinancialManagement() {
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Escrow Jobs State
  const [escrowJobs, setEscrowJobs] = useState<EscrowJob[]>([]);
  const [isLoadingEscrows, setIsLoadingEscrows] = useState(true);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowJob | null>(null);
  const [escrowStatusFilter, setEscrowStatusFilter] = useState<string>("all");
  const [escrowPage, setEscrowPage] = useState(1);
  const [escrowPagination, setEscrowPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDisputing, setIsDisputing] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveResolution, setResolveResolution] = useState<"release" | "refund">("release");
  const [resolveReason, setResolveReason] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Disputes State
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoadingDisputes, setIsLoadingDisputes] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputesPage, setDisputesPage] = useState(1);
  const [disputesPagination, setDisputesPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch escrow jobs
  useEffect(() => {
    if (activeTab === "escrow" || activeTab === "overview") {
      fetchEscrowJobs();
    }
  }, [activeTab, escrowPage, escrowStatusFilter]);

  // Fetch disputes
  useEffect(() => {
    if (activeTab === "disputes") {
      fetchDisputes();
    }
  }, [activeTab, disputesPage]);

  const fetchEscrowJobs = async () => {
    setIsLoadingEscrows(true);
    try {
      const response = await getEscrowJobs({
        page: escrowPage,
        limit: 10,
        status: escrowStatusFilter !== "all" ? escrowStatusFilter : undefined,
      });

      if (response.success && response.data) {
        setEscrowJobs(response.data.escrowJobs || []);
        if (response.data.pagination) {
          setEscrowPagination(response.data.pagination);
        }
      } else {
        const errorMsg = response.error || "Failed to fetch escrow jobs";
        console.error("Escrow jobs error:", errorMsg);
        toast.error(errorMsg, {
          description: "Backend database error. Please contact support if this persists.",
          duration: 5000,
        });
        setEscrowJobs([]);
      }
    } catch (error) {
      console.error("Error fetching escrow jobs:", error);
      toast.error("Failed to fetch escrow jobs. Please try again.");
      setEscrowJobs([]);
    } finally {
      setIsLoadingEscrows(false);
    }
  };

  const fetchEscrowDetails = async (escrowId: string) => {
    try {
      const response = await getEscrowJobById(escrowId);
      if (response.success && response.data) {
        setSelectedEscrow(response.data);
      } else {
        toast.error(response.error || "Failed to fetch escrow details");
      }
    } catch (error) {
      console.error("Error fetching escrow details:", error);
      toast.error("Failed to fetch escrow details");
    }
  };

  const fetchDisputes = async () => {
    setIsLoadingDisputes(true);
    try {
      const response = await getAllDisputes({
        page: disputesPage,
        limit: 10,
      });

      if (response.success && response.data) {
        setDisputes(response.data.disputes || []);
        if (response.data.pagination) {
          setDisputesPagination(response.data.pagination);
        }
      } else {
        const errorMsg = response.error || "Failed to fetch disputes";
        console.error("Disputes error:", errorMsg);
        toast.error(errorMsg, {
          description: "Backend database error. Please contact support if this persists.",
          duration: 5000,
        });
        setDisputes([]);
      }
    } catch (error) {
      console.error("Error fetching disputes:", error);
      toast.error("Failed to fetch disputes. Please try again.");
      setDisputes([]);
    } finally {
      setIsLoadingDisputes(false);
    }
  };

  const handleUpdateEscrowStatus = async (escrowId: string, status: string) => {
    setIsUpdatingStatus(true);
    try {
      const response = await updateEscrowStatus(escrowId, status);

      if (response.success) {
        toast.success(response.message || "Escrow status updated successfully");
        if (selectedEscrow && selectedEscrow.id === escrowId) {
          fetchEscrowDetails(escrowId);
        }
        fetchEscrowJobs();
      } else {
        toast.error(response.error || "Failed to update escrow status");
      }
    } catch (error) {
      console.error("Error updating escrow status:", error);
      toast.error("Failed to update escrow status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDisputeEscrow = async (escrowId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for disputing this escrow");
      return;
    }

    setIsDisputing(true);
    try {
      const response = await disputeEscrowJob(escrowId, reason.trim());

      if (response.success) {
        toast.success(response.message || "Escrow disputed successfully");
        setShowDisputeModal(false);
        setDisputeReason("");
        if (selectedEscrow && selectedEscrow.id === escrowId) {
          fetchEscrowDetails(escrowId);
        }
        fetchEscrowJobs();
      } else {
        toast.error(response.error || "Failed to dispute escrow");
      }
    } catch (error) {
      console.error("Error disputing escrow:", error);
      toast.error("Failed to dispute escrow. Please try again.");
    } finally {
      setIsDisputing(false);
    }
  };

  const handleResolveEscrowDispute = async (escrowId: string, resolution: "release" | "refund", reason: string) => {
    if (!reason.trim()) {
      toast.error("Please provide a resolution reason");
      return;
    }

    setIsResolving(true);
    try {
      const response = await resolveEscrowDispute(escrowId, resolution, reason.trim());

      if (response.success) {
        toast.success(response.message || "Dispute resolved successfully");
        setShowResolveModal(false);
        setResolveReason("");
        setResolveResolution("release");
        if (selectedEscrow && selectedEscrow.id === escrowId) {
          fetchEscrowDetails(escrowId);
        }
        fetchEscrowJobs();
        fetchDisputes();
      } else {
        toast.error(response.error || "Failed to resolve dispute");
      }
    } catch (error) {
      console.error("Error resolving dispute:", error);
      toast.error("Failed to resolve dispute. Please try again.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleResolveDispute = async (disputeId: string, resolution: "release" | "refund", reason: string) => {
    if (!reason.trim()) {
      toast.error("Please provide a resolution reason");
      return;
    }

    setIsResolving(true);
    try {
      const response = await resolveDispute(disputeId, resolution, reason.trim());

      if (response.success) {
        toast.success(response.message || "Dispute resolved successfully");
        setShowResolveModal(false);
        setResolveReason("");
        setResolveResolution("release");
        setSelectedDispute(null);
        fetchDisputes();
        fetchEscrowJobs();
      } else {
        toast.error(response.error || "Failed to resolve dispute");
      }
    } catch (error) {
      console.error("Error resolving dispute:", error);
      toast.error("Failed to resolve dispute. Please try again.");
    } finally {
      setIsResolving(false);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "-";
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending_payment: "bg-gray-100 text-gray-700 border-gray-200",
      payment_processing: "bg-purple-100 text-purple-700 border-purple-200",
      locked: "bg-blue-100 text-blue-700 border-blue-200",
      work_in_progress: "bg-cyan-100 text-cyan-700 border-cyan-200",
      work_submitted: "bg-indigo-100 text-indigo-700 border-indigo-200",
      under_review: "bg-amber-100 text-amber-700 border-amber-200",
      approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      releasing: "bg-yellow-100 text-yellow-700 border-yellow-200",
      released: "bg-green-100 text-green-700 border-green-200",
      refunding: "bg-orange-100 text-orange-700 border-orange-200",
      refunded: "bg-slate-100 text-slate-700 border-slate-200",
      disputed: "bg-red-100 text-red-700 border-red-200",
    };
    const displayName = status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return (
      <Badge variant="outline" className={variants[status] || "bg-slate-100 text-slate-700 border-slate-200"}>
        {displayName}
      </Badge>
    );
  };

  // Valid statuses from backend (no duplicates) - memoized to prevent re-creation
  const validStatuses = useMemo(() => {
    const statuses = [
      "pending_payment",
      "payment_processing",
      "locked",
      "work_in_progress",
      "work_submitted",
      "under_review",
      "approved",
      "releasing",
      "released",
      "refunding",
      "refunded",
      "disputed",
    ];
    // Remove duplicates using Set
    return Array.from(new Set(statuses));
  }, []);

  // Calculate stats
  const escrowStats = {
    total: escrowPagination.total || 0,
    locked: escrowJobs.filter((e) => e.status === "locked").length,
    released: escrowJobs.filter((e) => e.status === "released").length,
    disputed: escrowJobs.filter((e) => e.status === "disputed").length,
    refunded: escrowJobs.filter((e) => e.status === "refunded").length,
    refunding: escrowJobs.filter((e) => e.status === "refunding").length,
    releasing: escrowJobs.filter((e) => e.status === "releasing").length,
    totalAmount: escrowJobs.reduce((sum, e) => sum + (e.amount || 0), 0),
    lockedAmount: escrowJobs.filter((e) => e.status === "locked").reduce((sum, e) => sum + (e.amount || 0), 0),
    releasedAmount: escrowJobs.filter((e) => e.status === "released").reduce((sum, e) => sum + (e.amount || 0), 0),
    disputedAmount: escrowJobs.filter((e) => e.status === "disputed").reduce((sum, e) => sum + (e.amount || 0), 0),
  };

  // Chart data for status distribution
  const statusDistributionData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    validStatuses.forEach((status) => {
      statusCounts[status] = escrowJobs.filter((e) => e.status === status).length;
    });
    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        value: count,
        status,
      }));
  }, [escrowJobs, validStatuses]);

  // Chart data for amount by status
  const amountByStatusData = useMemo(() => {
    const statusAmounts: Record<string, number> = {};
    validStatuses.forEach((status) => {
      statusAmounts[status] = escrowJobs
        .filter((e) => e.status === status)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
    });
    return Object.entries(statusAmounts)
      .filter(([_, amount]) => amount > 0)
      .map(([status, amount]) => ({
        name: status.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        amount: amount,
        status,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [escrowJobs, validStatuses]);

  // Chart colors
  const CHART_COLORS = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#6366f1", // indigo
    "#14b8a6", // teal
    "#64748b", // slate
  ];

  // Escrow Jobs Columns
  const escrowColumns = [
    {
      key: "id",
      label: "Escrow ID",
      render: (escrow: EscrowJob) => (
        <span className="font-mono text-sm font-medium">{escrow.id.substring(0, 8)}...</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (escrow: EscrowJob) => (
        <span className="font-semibold text-slate-900">{formatCurrency(escrow.amount)}</span>
      ),
    },
    {
      key: "sponsor",
      label: "Sponsor",
      render: (escrow: EscrowJob) => (
        <span>{escrow.sponsor?.name || "Unknown"}</span>
      ),
    },
    {
      key: "influencer",
      label: "Influencer",
      render: (escrow: EscrowJob) => (
        <span>{escrow.influencer?.name || "Unknown"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (escrow: EscrowJob) => statusBadge(escrow.status),
    },
    {
      key: "actions",
      label: "",
      render: (escrow: EscrowJob) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedEscrow(escrow);
            fetchEscrowDetails(escrow.id);
          }}
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Disputes Columns
  const disputesColumns = [
    {
      key: "id",
      label: "Dispute ID",
      render: (dispute: Dispute) => (
        <span className="font-mono text-sm font-medium">{dispute.id.substring(0, 8)}...</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (dispute: Dispute) => statusBadge(dispute.status),
    },
    {
      key: "reason",
      label: "Reason",
      render: (dispute: Dispute) => (
        <span className="text-sm">{dispute.dispute_reason || "-"}</span>
      ),
    },
    {
      key: "date",
      label: "Disputed At",
      render: (dispute: Dispute) => (
        <span className="text-sm text-slate-600">{formatDate(dispute.disputed_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (dispute: Dispute) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDispute(dispute)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {isSuperAdmin && dispute.status === "disputed" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => {
                setSelectedDispute(dispute);
                setShowResolveModal(true);
              }}
              title="Resolve Dispute"
            >
              <CheckCircle className="h-4 w-4" />
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
          <h1 className="text-slate-900 mb-1">Financial Management</h1>
          <p className="text-slate-600">Monitor escrow, transactions, and disputes</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          if (activeTab === "escrow") fetchEscrowJobs();
          if (activeTab === "disputes") fetchDisputes();
        }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="escrow">Escrow Jobs</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {isLoadingEscrows ? (
            <div className="p-8 text-center text-slate-500">
              Loading financial data...
            </div>
          ) : (
            <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Escrow Amount"
          value={formatCurrency(escrowStats.totalAmount)}
          icon={DollarSign}
        />
        <StatCard
          label="Locked Escrows"
          value={escrowStats.locked.toString()}
          icon={Lock}
        />
        <StatCard
          label="Released Escrows"
          value={escrowStats.released.toString()}
          icon={Unlock}
        />
        <StatCard
          label="Disputed Escrows"
          value={escrowStats.disputed.toString()}
          icon={AlertTriangle}
        />
              </div>

              {/* Additional Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Locked Amount"
                  value={formatCurrency(escrowStats.lockedAmount)}
                  icon={Lock}
                />
                <StatCard
                  label="Released Amount"
                  value={formatCurrency(escrowStats.releasedAmount)}
                  icon={Unlock}
                />
                <StatCard
                  label="Disputed Amount"
                  value={formatCurrency(escrowStats.disputedAmount)}
                  icon={AlertTriangle}
                />
                <StatCard
                  label="Total Escrows"
                  value={escrowStats.total.toString()}
                  icon={DollarSign}
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Escrow Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statusDistributionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statusDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-slate-500">
                        No data available for chart
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Amount by Status Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Amount by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {amountByStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={amountByStatusData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                            fontSize={12}
                          />
                          <YAxis />
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0" }}
                          />
                          <Legend />
                          <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                            {amountByStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-slate-500">
                        No data available for chart
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Escrow Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Escrow Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  {escrowJobs.length > 0 ? (
                    <div className="space-y-3">
                      {escrowJobs.slice(0, 5).map((escrow) => (
                        <div
                          key={escrow.id}
                          className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                          onClick={() => {
                            setSelectedEscrow(escrow);
                            fetchEscrowDetails(escrow.id);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100">
                              <DollarSign className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {formatCurrency(escrow.amount)}
                              </p>
                              <p className="text-xs text-slate-500 font-mono">
                                {escrow.id.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900">
                                {escrow.sponsor?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-slate-500">Sponsor</p>
                            </div>
                            {statusBadge(escrow.status)}
                            <Eye className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      ))}
                      {escrowJobs.length > 5 && (
                        <p className="text-sm text-center text-slate-500 pt-2">
                          Showing 5 of {escrowJobs.length} escrow jobs
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      No escrow jobs found
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Escrow Jobs Tab */}
        <TabsContent value="escrow" className="space-y-6">
          {/* Filters */}
        <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <Select value={escrowStatusFilter} onValueChange={(value: any) => setEscrowStatusFilter(value)}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {validStatuses.map((status, index) => {
                      const displayName = status
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");
                      return (
                        <SelectItem key={`filter-status-${status}-${index}`} value={status}>
                          {displayName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
          </CardContent>
        </Card>

          {/* Escrow Jobs Table */}
        <Card>
          <CardHeader>
              <CardTitle>Escrow Jobs</CardTitle>
          </CardHeader>
            <CardContent className="p-0">
              {isLoadingEscrows ? (
                <div className="p-8 text-center text-slate-500">
                  Loading escrow jobs...
                </div>
              ) : escrowJobs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No escrow jobs found.
                </div>
              ) : (
                <DataTable
                  columns={escrowColumns}
                  data={escrowJobs}
                  currentPage={escrowPagination.page}
                  totalPages={escrowPagination.totalPages}
                  onPageChange={setEscrowPage}
                  emptyMessage="No escrow jobs found"
                />
              )}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Disputes Tab */}
        <TabsContent value="disputes" className="space-y-6">
          {/* Disputes Table */}
      <Card>
        <CardHeader>
              <CardTitle>All Disputes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
              {isLoadingDisputes ? (
                <div className="p-8 text-center text-slate-500">
                  Loading disputes...
                </div>
              ) : disputes.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-500 mb-2">No disputes found.</p>
                  <p className="text-xs text-slate-400">
                    If you're seeing an error, it may be a backend database issue. Please check the console for details.
                  </p>
                </div>
              ) : (
                <DataTable
                  columns={disputesColumns}
                  data={disputes}
                  currentPage={disputesPagination.page}
                  totalPages={disputesPagination.totalPages}
                  onPageChange={setDisputesPage}
                  emptyMessage="No disputes found"
                />
              )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Escrow Detail Modal */}
      <Dialog open={!!selectedEscrow} onOpenChange={() => setSelectedEscrow(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Escrow Job Details</DialogTitle>
            <DialogDescription>
              View and manage escrow job information
            </DialogDescription>
          </DialogHeader>
          {selectedEscrow && (
            <div className="space-y-6">
              <div>
                <p className="font-mono text-sm text-slate-500">{selectedEscrow.id}</p>
                <div className="mt-4">
                  {statusBadge(selectedEscrow.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Amount</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatCurrency(selectedEscrow.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {statusBadge(selectedEscrow.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Sponsor</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedEscrow.sponsor?.name || "Unknown"}
                  </p>
                  {selectedEscrow.sponsor?.email && (
                    <p className="text-xs text-slate-500">{selectedEscrow.sponsor.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Influencer</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedEscrow.influencer?.name || "Unknown"}
                  </p>
                  {selectedEscrow.influencer?.email && (
                    <p className="text-xs text-slate-500">{selectedEscrow.influencer.email}</p>
                  )}
                </div>
                {selectedEscrow.dispute_reason && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-slate-600 mb-1">Dispute Reason</p>
                    <p className="text-sm text-slate-900 bg-red-50 p-2 rounded">
                      {selectedEscrow.dispute_reason}
                    </p>
                  </div>
                )}
                {selectedEscrow.disputed_at && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Disputed At</p>
                    <p className="text-sm text-slate-900">{formatDate(selectedEscrow.disputed_at)}</p>
                  </div>
                )}
                {selectedEscrow.dispute_resolution && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-slate-600 mb-1">Resolution</p>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedEscrow.dispute_resolution === "release" ? "Release to Influencer" : "Refund to Sponsor"}
                    </p>
                    {selectedEscrow.dispute_resolution_reason && (
                      <p className="text-xs text-slate-600 mt-1">{selectedEscrow.dispute_resolution_reason}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Change Status */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-slate-600 mb-3">Change Status</p>
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedEscrow.status}
                    onValueChange={(newStatus) => {
                      const displayName = newStatus
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");
                      if (window.confirm(`Are you sure you want to change status to "${displayName}"?`)) {
                        handleUpdateEscrowStatus(selectedEscrow.id, newStatus);
                      }
                    }}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {validStatuses.map((status, index) => {
                        const displayName = status
                          .split("_")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ");
                        return (
                          <SelectItem key={`status-${status}-${index}`} value={status}>
                            {displayName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {isUpdatingStatus && (
                    <span className="text-sm text-slate-500">Updating...</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-slate-600 mb-3">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEscrow.status === "locked" && (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to release this escrow?")) {
                          handleUpdateEscrowStatus(selectedEscrow.id, "released");
                        }
                      }}
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus ? "Updating..." : "Release Escrow"}
                    </Button>
                  )}
                  {selectedEscrow.status === "locked" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setShowDisputeModal(true);
                      }}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Dispute Escrow
                    </Button>
                  )}
                  {selectedEscrow.status === "disputed" && isSuperAdmin && (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setShowResolveModal(true);
                      }}
                      disabled={isResolving}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Resolve Dispute
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dispute Modal */}
      <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dispute Escrow</DialogTitle>
            <DialogDescription>
              Provide a reason for disputing this escrow job.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="disputeReason" className="text-sm font-medium text-slate-700 mb-2 block">
                Reason
              </label>
              <Textarea
                id="disputeReason"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="e.g., Work not delivered as promised, Quality issues..."
                className="min-h-[100px]"
                disabled={isDisputing}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDisputeModal(false);
                  setDisputeReason("");
                }}
                disabled={isDisputing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (selectedEscrow) {
                    handleDisputeEscrow(selectedEscrow.id, disputeReason);
                  }
                }}
                disabled={isDisputing || !disputeReason.trim()}
              >
                {isDisputing ? "Disputing..." : "Dispute Escrow"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolve Dispute Modal */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              {selectedEscrow ? "Resolve this escrow dispute" : "Resolve this dispute"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="resolveResolution" className="text-sm font-medium text-slate-700 mb-2 block">
                Resolution
              </label>
              <Select value={resolveResolution} onValueChange={(value: "release" | "refund") => setResolveResolution(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="release">Release to Influencer</SelectItem>
                  <SelectItem value="refund">Refund to Sponsor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="resolveReason" className="text-sm font-medium text-slate-700 mb-2 block">
                Resolution Reason
              </label>
              <Textarea
                id="resolveReason"
                value={resolveReason}
                onChange={(e) => setResolveReason(e.target.value)}
                placeholder="e.g., Work approved after review, Issue resolved..."
                className="min-h-[100px]"
                disabled={isResolving}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResolveModal(false);
                  setResolveReason("");
                  setResolveResolution("release");
                }}
                disabled={isResolving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (selectedEscrow) {
                    handleResolveEscrowDispute(selectedEscrow.id, resolveResolution, resolveReason);
                  } else if (selectedDispute) {
                    handleResolveDispute(selectedDispute.id, resolveResolution, resolveReason);
                  }
                }}
                disabled={isResolving || !resolveReason.trim()}
              >
                {isResolving ? "Resolving..." : "Resolve Dispute"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dispute Detail Modal */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
            <DialogDescription>
              View dispute information
            </DialogDescription>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-6">
              <div>
                <p className="font-mono text-sm text-slate-500">{selectedDispute.id}</p>
                <div className="mt-4">
                  {statusBadge(selectedDispute.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Status</p>
                  <div>{statusBadge(selectedDispute.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Disputed At</p>
                  <p className="text-sm text-slate-900">{formatDate(selectedDispute.disputed_at)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-slate-600 mb-1">Dispute Reason</p>
                  <p className="text-sm text-slate-900 bg-red-50 p-2 rounded">
                    {selectedDispute.dispute_reason || "-"}
                  </p>
                </div>
                {selectedDispute.dispute_resolution && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-slate-600 mb-1">Resolution</p>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedDispute.dispute_resolution === "release" ? "Release to Influencer" : "Refund to Sponsor"}
                    </p>
                    {selectedDispute.dispute_resolution_reason && (
                      <p className="text-xs text-slate-600 mt-1">{selectedDispute.dispute_resolution_reason}</p>
                    )}
                  </div>
                )}
              </div>

              {isSuperAdmin && selectedDispute.status === "disputed" && (
                <div className="pt-4 border-t">
                  <Button
                    type="button"
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setShowResolveModal(true);
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Resolve Dispute
                  </Button>
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
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-slate-900 mt-1 text-lg font-semibold">{value}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
