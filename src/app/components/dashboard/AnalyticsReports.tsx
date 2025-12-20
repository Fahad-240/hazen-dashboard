import { Download, TrendingUp, Users, DollarSign, Handshake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const userGrowthData = [
  { month: "Jan", buyers: 450, sellers: 320, agents: 120 },
  { month: "Feb", buyers: 520, sellers: 380, agents: 145 },
  { month: "Mar", buyers: 480, sellers: 340, agents: 135 },
  { month: "Apr", buyers: 610, sellers: 420, agents: 168 },
  { month: "May", buyers: 550, sellers: 390, agents: 152 },
  { month: "Jun", buyers: 670, sellers: 450, agents: 189 },
];

const dealVolumeData = [
  { week: "Week 1", volume: 45, value: 12500 },
  { week: "Week 2", volume: 52, value: 15200 },
  { week: "Week 3", volume: 48, value: 13800 },
  { week: "Week 4", volume: 61, value: 18900 },
];

const conversionData = [
  { stage: "Signup", users: 1000 },
  { stage: "Profile Complete", users: 850 },
  { stage: "First Browse", users: 720 },
  { stage: "First Inquiry", users: 450 },
  { stage: "First Deal", users: 280 },
];

export function AnalyticsReports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-1">Analytics & Reports</h1>
          <p className="text-slate-600">Comprehensive platform insights and metrics</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value="7,915"
          change="+12.5%"
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Total Deals"
          value="1,234"
          change="+8.2%"
          icon={Handshake}
          color="purple"
        />
        <StatCard
          label="Total Revenue"
          value="$328K"
          change="+15.3%"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          label="Growth Rate"
          value="24.5%"
          change="+3.1%"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="deals">Deal Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        {/* User Analytics */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorBuyers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSellers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAgents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="buyers"
                    stroke="#0ea5e9"
                    fillOpacity={1}
                    fill="url(#colorBuyers)"
                    name="Buyers"
                  />
                  <Area
                    type="monotone"
                    dataKey="sellers"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorSellers)"
                    name="Sellers"
                  />
                  <Area
                    type="monotone"
                    dataKey="agents"
                    stroke="#ec4899"
                    fillOpacity={1}
                    fill="url(#colorAgents)"
                    name="Agents"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deal Analytics */}
        <TabsContent value="deals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deal Volume & Value</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dealVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="volume" fill="#0ea5e9" name="Deal Count" />
                  <Bar dataKey="value" fill="#8b5cf6" name="Deal Value ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Analytics */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={[
                    { month: "Jan", revenue: 45000 },
                    { month: "Feb", revenue: 52000 },
                    { month: "Mar", revenue: 48000 },
                    { month: "Apr", revenue: 61000 },
                    { month: "May", revenue: 55000 },
                    { month: "Jun", revenue: 67000 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 5 }}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Funnel */}
        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={conversionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis dataKey="stage" type="category" stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#0ea5e9" name="Users" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  <strong>Conversion Rate:</strong> 28% of signups complete their first deal
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
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
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-slate-900 mt-1">{value}</p>
            <p className="text-xs text-green-600 mt-2">{change} vs last month</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
