import { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  DollarSign,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getDashboardAnalytics, DashboardAnalytics } from "../../services/api";
import { toast } from "sonner";

const COLORS = {
  influencer: "#0ea5e9",
  sponsor: "#8b5cf6",
  agent: "#10b981",
  admin: "#f59e0b",
  active: "#10b981",
  closed: "#64748b",
  pending: "#f59e0b",
};

export function DashboardOverview() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await getDashboardAnalytics();

      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        toast.error(response.error || "Failed to fetch dashboard analytics");
      }
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      toast.error("Failed to fetch dashboard analytics");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Prepare data for charts
  const usersByRoleData = analytics?.users?.byRole
    ? Object.entries(analytics.users.byRole)
        .filter(([_, count]) => count && count > 0)
        .map(([role, count]) => ({
          name: role.charAt(0).toUpperCase() + role.slice(1),
          value: count || 0,
          color: COLORS[role as keyof typeof COLORS] || "#64748b",
        }))
    : [];

  const gigsByStatusData = analytics?.gigs?.byStatus
    ? Object.entries(analytics.gigs.byStatus)
        .filter(([_, count]) => count && count > 0)
        .map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count || 0,
          color: COLORS[status as keyof typeof COLORS] || "#64748b",
        }))
    : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-slate-900 mb-1">Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-3"></div>
            <div className="text-slate-500">Loading dashboard analytics...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-1">Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAnalytics(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Users"
          value={analytics?.users?.total ? analytics.users.total.toLocaleString() : "0"}
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Total Gigs"
          value={analytics?.gigs?.total ? analytics.gigs.total.toLocaleString() : "0"}
          icon={Briefcase}
          color="purple"
        />
        <KPICard
          title="Total Transactions"
          value={analytics?.transactions?.total ? analytics.transactions.total.toLocaleString() : "0"}
          icon={CreditCard}
          color="green"
        />
        <KPICard
          title="Total Revenue"
          value={analytics?.transactions?.revenueLastMonth ? formatCurrency(analytics.transactions.revenueLastMonth) : "$0.00"}
          icon={DollarSign}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            {usersByRoleData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usersByRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {usersByRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {usersByRoleData.map((role) => (
                    <div key={role.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <div>
                        <p className="text-xs text-slate-600">{role.name}</p>
                        <p className="font-semibold text-slate-900">{role.value.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gigs by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Gigs by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {gigsByStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gigsByStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gigsByStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {gigsByStatusData.map((status) => (
                    <div key={status.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <div>
                        <p className="text-xs text-slate-600">{status.name}</p>
                        <p className="font-semibold text-slate-900">{status.value.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: any;
  color: "blue" | "purple" | "green" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600">{title}</p>
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
