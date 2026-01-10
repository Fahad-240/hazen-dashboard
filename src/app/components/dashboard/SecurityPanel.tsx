import { Shield, AlertTriangle, Activity, Lock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DataTable } from "../shared/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const auditLogs: Array<{
  id: string;
  action: string;
  admin: string;
  ip: string;
  timestamp: string;
  status: string;
}> = [];

const fraudAlerts: Array<{
  id: string;
  type: string;
  user: string;
  severity: string;
  timestamp: string;
}> = [];

export function SecurityPanel() {
  const auditColumns = [
    { key: "timestamp", label: "Timestamp" },
    { key: "action", label: "Action" },
    { key: "admin", label: "Admin" },
    { key: "ip", label: "IP Address" },
    {
      key: "status",
      label: "Status",
      render: (item: typeof auditLogs[0]) => (
        <Badge className="bg-green-100 text-green-700">{item.status}</Badge>
      ),
    },
  ];

  const fraudColumns = [
    {
      key: "id",
      label: "Alert ID",
      render: (item: typeof fraudAlerts[0]) => (
        <span className="font-mono text-sm">{item.id}</span>
      ),
    },
    { key: "type", label: "Type" },
    { key: "user", label: "User" },
    {
      key: "severity",
      label: "Severity",
      render: (item: typeof fraudAlerts[0]) => {
        const colors: Record<string, string> = {
          High: "bg-red-100 text-red-700",
          Medium: "bg-yellow-100 text-yellow-700",
          Low: "bg-blue-100 text-blue-700",
        };
        return <Badge className={colors[item.severity]}>{item.severity}</Badge>;
      },
    },
    { key: "timestamp", label: "Detected" },
    {
      key: "actions",
      label: "",
      render: () => (
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-1">Security & Compliance</h1>
        <p className="text-slate-600">Monitor security events and compliance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Security Score" value="98%" icon={Shield} color="green" />
        <StatCard label="Active Alerts" value="3" icon={AlertTriangle} color="yellow" />
        <StatCard label="Active Sessions" value="2,341" icon={Activity} color="blue" />
        <StatCard label="Failed Logins (24h)" value="12" icon={Lock} color="red" />
      </div>

      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Alerts</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR Requests</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>

        {/* Audit Logs */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Admin Activity Audit Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable columns={auditColumns} data={auditLogs} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fraud Alerts */}
        <TabsContent value="fraud">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable columns={fraudColumns} data={fraudAlerts} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* GDPR Requests */}
        <TabsContent value="gdpr">
          <Card>
            <CardHeader>
              <CardTitle>GDPR & Data Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RequestItem
                  type="Data Export"
                  user="john.doe@example.com"
                  status="Pending"
                  date="2024-12-20"
                />
                <RequestItem
                  type="Account Deletion"
                  user="jane.smith@example.com"
                  status="In Progress"
                  date="2024-12-19"
                />
                <RequestItem
                  type="Data Correction"
                  user="mike.j@example.com"
                  status="Completed"
                  date="2024-12-18"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control */}
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Admin Access Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AdminRole
                  role="Super Admin"
                  count={2}
                  permissions="Full system access, user management, security settings"
                />
                <AdminRole
                  role="Admin"
                  count={5}
                  permissions="User management, deal oversight, content moderation"
                />
                <AdminRole
                  role="Moderator"
                  count={12}
                  permissions="Content moderation, flag review"
                />
                <AdminRole
                  role="Support"
                  count={20}
                  permissions="User support, ticket management, read-only analytics"
                />
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
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-slate-900 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestItem({
  type,
  user,
  status,
  date,
}: {
  type: string;
  user: string;
  status: string;
  date: string;
}) {
  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
  };

  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900">{type}</p>
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
          <span>User: {user}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
      </div>
      <Button variant="outline" size="sm">
        Review
      </Button>
    </div>
  );
}

function AdminRole({
  role,
  count,
  permissions,
}: {
  role: string;
  count: number;
  permissions: string;
}) {
  return (
    <div className="p-4 border border-slate-200 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-slate-900">{role}</h3>
          <p className="text-sm text-slate-600 mt-0.5">{count} admins</p>
        </div>
        <Button variant="outline" size="sm">
          Manage
        </Button>
      </div>
      <p className="text-sm text-slate-600 mt-2">{permissions}</p>
    </div>
  );
}
