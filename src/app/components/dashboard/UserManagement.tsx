import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  EllipsisVertical,
  Eye,
  Ban,
  CircleCheck,
  CircleX,
  Mail,
  Calendar,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Buyer",
    status: "Active",
    verified: true,
    joinDate: "2024-01-15",
    deals: 12,
    spent: "$45,230",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Seller",
    status: "Active",
    verified: true,
    joinDate: "2024-02-20",
    deals: 28,
    spent: "$0",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.j@example.com",
    role: "Agent",
    status: "Active",
    verified: true,
    joinDate: "2024-03-10",
    deals: 156,
    spent: "$0",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    role: "Buyer",
    status: "Suspended",
    verified: false,
    joinDate: "2024-04-05",
    deals: 3,
    spent: "$2,100",
  },
  {
    id: "5",
    name: "Tom Brown",
    email: "tom.brown@example.com",
    role: "Seller",
    status: "Pending",
    verified: false,
    joinDate: "2024-12-18",
    deals: 0,
    spent: "$0",
  },
];

export function UserManagement() {
  const { permissions } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-slate-900 mb-1">User Management</h1>
          <p className="text-slate-600">Manage and monitor all platform users</p>
        </div>
        {permissions.export_user_data && (
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Users
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value="7,915" badge="+12%" badgeVariant="success" />
        <StatCard label="Active Users" value="6,234" badge="78.8%" badgeVariant="default" />
        <StatCard label="Pending Verification" value="234" badge="2.9%" badgeVariant="warning" />
        <StatCard label="Suspended" value="45" badge="0.6%" badgeVariant="destructive" />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Buyer">Buyers</SelectItem>
                <SelectItem value="Seller">Sellers</SelectItem>
                <SelectItem value="Agent">Agents</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-slate-100 text-slate-700 text-xs">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "Active"
                            ? "default"
                            : user.status === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.verified ? (
                        <CircleCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <CircleX className="h-4 w-4 text-slate-300" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{user.joinDate}</TableCell>
                    <TableCell className="text-sm text-slate-900">{user.deals}</TableCell>
                    <TableCell className="text-sm font-medium text-slate-900">
                      {user.spent}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <EllipsisVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {permissions.manage_users && (
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                          )}
                          {permissions.manage_users && (
                            <DropdownMenuItem>
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          )}
                          {permissions.ban_users && (
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="mr-2 h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                          )}
                          {permissions.delete_users && (
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information and activity
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-slate-900 text-white text-xl">
                    {selectedUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{selectedUser.name}</h3>
                  <p className="text-sm text-slate-600">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge>{selectedUser.role}</Badge>
                    <Badge
                      variant={
                        selectedUser.status === "Active" ? "default" : "destructive"
                      }
                    >
                      {selectedUser.status}
                    </Badge>
                    {selectedUser.verified && (
                      <Badge variant="outline" className="text-green-600">
                        <CircleCheck className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="deals">Deals</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="User ID" value={selectedUser.id} />
                    <InfoItem label="Join Date" value={selectedUser.joinDate} />
                    <InfoItem label="Total Deals" value={selectedUser.deals.toString()} />
                    <InfoItem label="Total Spent" value={selectedUser.spent} />
                  </div>
                </TabsContent>
                <TabsContent value="activity">
                  <p className="text-sm text-slate-600">Activity timeline coming soon...</p>
                </TabsContent>
                <TabsContent value="deals">
                  <p className="text-sm text-slate-600">Deal history coming soon...</p>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                {permissions.manage_users && (
                  <Button variant="outline" className="flex-1">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                )}
                {permissions.manage_users && (
                  <Button variant="destructive" className="flex-1">
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend User
                  </Button>
                )}
                {permissions.ban_users && (
                  <Button variant="destructive" className="flex-1">
                    <Ban className="mr-2 h-4 w-4" />
                    Ban User
                  </Button>
                )}
                {permissions.delete_users && (
                  <Button variant="destructive" className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete User
                  </Button>
                )}
              </div>
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
  badge,
  badgeVariant,
}: {
  label: string;
  value: string;
  badge: string;
  badgeVariant: "default" | "success" | "warning" | "destructive";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-slate-900 mt-1">{value}</p>
          </div>
          <Badge variant={badgeVariant === "success" ? "default" : badgeVariant}>
            {badge}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}