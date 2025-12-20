import { DollarSign, TrendingUp, TrendingDown, CreditCard, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DataTable } from "../shared/DataTable";

const revenueData = [
  { month: "Jan", revenue: 45000, commissions: 2250, payouts: 8900 },
  { month: "Feb", revenue: 52000, commissions: 2600, payouts: 10200 },
  { month: "Mar", revenue: 48000, commissions: 2400, payouts: 9500 },
  { month: "Apr", revenue: 61000, commissions: 3050, payouts: 12100 },
  { month: "May", revenue: 55000, commissions: 2750, payouts: 10900 },
  { month: "Jun", revenue: 67000, commissions: 3350, payouts: 13200 },
];

const transactions = [
  {
    id: "TXN-9876",
    type: "Deal Payment",
    user: "John Doe",
    amount: "$5,500",
    fee: "$275",
    status: "Completed",
    date: "2024-12-20",
  },
  {
    id: "TXN-9875",
    type: "Agent Payout",
    user: "Mike Johnson",
    amount: "$1,250",
    fee: "-",
    status: "Pending",
    date: "2024-12-19",
  },
  {
    id: "TXN-9874",
    type: "Refund",
    user: "Sarah Williams",
    amount: "$800",
    fee: "$0",
    status: "Completed",
    date: "2024-12-18",
  },
];

export function FinancialManagement() {
  const columns = [
    {
      key: "id",
      label: "Transaction ID",
      render: (item: typeof transactions[0]) => (
        <span className="font-mono text-sm font-medium">{item.id}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (item: typeof transactions[0]) => <Badge variant="outline">{item.type}</Badge>,
    },
    { key: "user", label: "User" },
    {
      key: "amount",
      label: "Amount",
      render: (item: typeof transactions[0]) => (
        <span className="font-semibold text-slate-900">{item.amount}</span>
      ),
    },
    { key: "fee", label: "Fee" },
    {
      key: "status",
      label: "Status",
      render: (item: typeof transactions[0]) => (
        <Badge variant={item.status === "Completed" ? "default" : "secondary"}>
          {item.status}
        </Badge>
      ),
    },
    { key: "date", label: "Date" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-1">Financial Management</h1>
          <p className="text-slate-600">Monitor revenue, transactions, and payouts</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value="$328,000"
          change="+12.5%"
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          label="Total Commissions"
          value="$16,400"
          change="+8.2%"
          trend="up"
          icon={CreditCard}
        />
        <StatCard
          label="Pending Payouts"
          value="$45,200"
          change="-3.1%"
          trend="down"
          icon={TrendingDown}
        />
        <StatCard
          label="Net Profit"
          value="$266,400"
          change="+15.7%"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="commissions"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Commissions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="payouts" fill="#0ea5e9" name="Payouts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: any;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-slate-900 mt-1">{value}</p>
            <p className={`text-xs mt-2 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {change} vs last month
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
