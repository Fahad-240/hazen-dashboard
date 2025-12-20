import {
  Users,
  Handshake,
  DollarSign,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Activity,
  CircleAlert,
  CircleCheck,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 45000, deals: 120 },
  { month: "Feb", revenue: 52000, deals: 145 },
  { month: "Mar", revenue: 48000, deals: 135 },
  { month: "Apr", revenue: 61000, deals: 168 },
  { month: "May", revenue: 55000, deals: 152 },
  { month: "Jun", revenue: 67000, deals: 189 },
  { month: "Jul", revenue: 72000, deals: 205 },
];

const userRoleData = [
  { name: "Buyers", value: 3420, color: "#0ea5e9" },
  { name: "Sellers", value: 2890, color: "#8b5cf6" },
  { name: "Agents", value: 1560, color: "#ec4899" },
  { name: "Admins", value: 45, color: "#f59e0b" },
];

const activityData = [
  { time: "00:00", users: 245 },
  { time: "04:00", users: 189 },
  { time: "08:00", users: 512 },
  { time: "12:00", users: 789 },
  { time: "16:00", users: 654 },
  { time: "20:00", users: 432 },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-slate-900 mb-1">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Users"
          value="7,915"
          change="+12.5%"
          trend="up"
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Active Deals"
          value="1,234"
          change="+8.2%"
          trend="up"
          icon={Handshake}
          color="purple"
        />
        <KPICard
          title="Monthly Revenue"
          value="$72,450"
          change="+15.3%"
          trend="up"
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Conversion Rate"
          value="3.24%"
          change="-0.4%"
          trend="down"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Deal Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ fill: "#0ea5e9" }}
                  name="Revenue ($)"
                />
                <Line
                  type="monotone"
                  dataKey="deals"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6" }}
                  name="Deals"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {userRoleData.map((role) => (
                <div key={role.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <div>
                    <p className="text-xs text-slate-600">{role.name}</p>
                    <p className="font-semibold">{role.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Users (Last 24 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#0ea5e9"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HealthItem
              label="API Response Time"
              value="45ms"
              status="good"
              icon={CircleCheck}
            />
            <HealthItem
              label="Database Load"
              value="67%"
              status="warning"
              icon={CircleAlert}
            />
            <HealthItem
              label="Active Sessions"
              value="2,341"
              status="good"
              icon={Activity}
            />
            <HealthItem
              label="Queue Status"
              value="12 pending"
              status="good"
              icon={Clock}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ActivityItem
              user="John Doe"
              action="registered as a new user"
              time="2 minutes ago"
              type="user"
            />
            <ActivityItem
              user="Jane Smith"
              action="completed deal #4523"
              time="15 minutes ago"
              type="deal"
            />
            <ActivityItem
              user="Mike Johnson"
              action="submitted payout request for $1,250"
              time="1 hour ago"
              type="payout"
            />
            <ActivityItem
              user="Sarah Williams"
              action="flagged content for moderation"
              time="2 hours ago"
              type="flag"
            />
            <ActivityItem
              user="Admin System"
              action="completed daily backup"
              time="3 hours ago"
              type="system"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: any;
  color: string;
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
            <p className="text-slate-900 mt-1">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={`text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}
              >
                {change}
              </span>
              <span className="text-xs text-slate-500">vs last month</span>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthItem({
  label,
  value,
  status,
  icon: Icon,
}: {
  label: string;
  value: string;
  status: "good" | "warning" | "error";
  icon: any;
}) {
  const statusColors = {
    good: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${statusColors[status]}`} />
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

function ActivityItem({
  user,
  action,
  time,
  type,
}: {
  user: string;
  action: string;
  time: string;
  type: string;
}) {
  const typeColors: Record<string, string> = {
    user: "bg-blue-100 text-blue-700",
    deal: "bg-green-100 text-green-700",
    payout: "bg-purple-100 text-purple-700",
    flag: "bg-red-100 text-red-700",
    system: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
      <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900">
          <span className="font-medium">{user}</span> {action}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className={`text-xs ${typeColors[type]}`}>
            {type}
          </Badge>
          <span className="text-xs text-slate-500">{time}</span>
        </div>
      </div>
    </div>
  );
}