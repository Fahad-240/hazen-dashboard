import { useState, useEffect } from "react";
import {
  Search,
  Download,
  EllipsisVertical,
  Eye,
  Ban,
  CircleCheck,
  CircleX,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent } from "../ui/card";
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
import { getUsersList } from "../../services/api";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  verified: boolean;
  joinDate: string;
  deals: number;
  spent: string;
  is_active?: boolean;
}

export function UserManagement() {
  const { permissions, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnverifying, setIsUnverifying] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsersList({
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      });

      if (response.success && response.data?.users) {
        // Map API response to component format
        const mappedUsers = response.data.users.map((user: any) => ({
          id: user.id,
          name: user.name || user.email?.split("@")[0] || "Unknown",
          email: user.email,
          role: user.role || "User",
          status: user.is_active === false ? "Suspended" : user.status || "Active",
          verified: user.verified || user.email_verified || false,
          joinDate: user.created_at 
            ? new Date(user.created_at).toISOString().split("T")[0] 
            : new Date().toISOString().split("T")[0],
          deals: user.deals || 0,
          spent: user.spent ? `$${user.spent}` : "$0",
        }));
        setUsers(mappedUsers);
      } else {
        toast.error(response.error || "Failed to fetch users");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchUsers();
    }
  }, [roleFilter, statusFilter]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSuspendUser = async (userId: string, isCurrentlySuspended: boolean) => {
    if (!window.confirm(isCurrentlySuspended 
      ? "Kya aap is user ko activate karna chahte hain?" 
      : "Kya aap is user ko suspend karna chahte hain?")) {
      return;
    }

    setIsSuspending(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      // Backend endpoint: /api/admin/users/{user_id}/status (confirmed working)
      const endpoint = `/api/admin/users/${userId}/status`;
      const method = "PATCH";

      console.log(`🔄 Updating user status: ${endpoint} with method: ${method}`);

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_active: isCurrentlySuspended ? true : false,
        }),
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      // Parse response
      const responseText = await response.text();
      console.log('📥 Response text:', responseText.substring(0, 200));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', responseText);
        throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}. Response: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        toast.error(data.message || data.error || "Failed to update user status");
        return;
      }

      toast.success(isCurrentlySuspended ? "User activated successfully" : "User suspended successfully");
      setSelectedUser(null);
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error("Suspend user error:", error);
      toast.error("Failed to update user status");
    } finally {
      setIsSuspending(false);
    }
  };

  const handleVerifyUser = async (userId: string, isCurrentlyVerified: boolean) => {
    // API only supports verifying (not removing verification)
    if (isCurrentlyVerified) {
      toast.info("User is already verified. This API only supports verifying users.");
      return;
    }

    if (!window.confirm("Kya aap is user ko verify karna chahte hain?")) {
      return;
    }

    setIsVerifying(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      // Backend endpoint: POST /admin/users/{user_id}/verify
      // Body: { "verified": true }
      const endpoint = `/api/admin/users/${userId}/verify`;
      console.log('🔍 Verify endpoint:', endpoint);
      const method = "POST";

      console.log(`🔄 Verifying user: ${endpoint} with method: ${method}`);

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verified: true
        }),
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      // Parse response
      const responseText = await response.text();
      console.log('📥 Response text:', responseText.substring(0, 200));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', responseText);
        throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400) {
          // Check if user is already verified
          const message = data?.message?.toLowerCase() || '';
          if (message.includes("already verified") || message.includes("is already verified")) {
            toast.warning("User is already verified");
            // Refresh users list to update verified status
            await fetchUsers();
            setSelectedUser(null);
            return;
          } else {
            toast.error(data?.message || "Bad request. Please check the user status.");
          }
        } else if (response.status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else if (response.status === 403) {
          toast.error("Access denied. Admin role required.");
        } else if (response.status === 404) {
          toast.error("User not found");
        } else {
          const errorMsg = data?.message || data?.error || `Failed to verify user: ${response.status} ${response.statusText}`;
          toast.error(errorMsg);
        }
        console.error('❌ Verification failed:', {
          status: response.status,
          statusText: response.statusText,
          endpoint: endpoint,
          data: data
        });
        return;
      }

      // Success - user verified
      toast.success(data?.message || "User verified successfully");
      console.log('✅ User verified:', data?.user);
      
      // Update selectedUser state if modal is open
      if (selectedUser) {
        setSelectedUser({
          ...selectedUser,
          verified: true
        });
      }
      
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error("Verify user error:", error);
      toast.error("Failed to verify user. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUnverifyUser = async (userId: string) => {
    if (!window.confirm("Kya aap is user ki verification remove karna chahte hain?")) {
      return;
    }

    setIsUnverifying(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      // Backend endpoint: POST /admin/users/{user_id}/verify
      // Body: { "verified": false }
      const endpoint = `/api/admin/users/${userId}/verify`;
      console.log('🔍 Unverify endpoint:', endpoint);
      const method = "POST";

      console.log(`🔄 Unverifying user: ${endpoint} with method: ${method}`);

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verified: false
        }),
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      // Parse response
      const responseText = await response.text();
      console.log('📥 Response text:', responseText.substring(0, 200));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', responseText);
        throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `Failed to unverify user: ${response.status} ${response.statusText}`;
        console.error('❌ Unverification failed:', {
          status: response.status,
          statusText: response.statusText,
          endpoint: endpoint,
          data: data
        });
        toast.error(errorMsg);
        return;
      }

      // Success - user unverified
      toast.success(data?.message || "User verification removed successfully");
      console.log('✅ User unverified:', data?.user || data);
      
      // Update selectedUser state if modal is open
      if (selectedUser) {
        setSelectedUser({
          ...selectedUser,
          verified: false
        });
      }
      
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error("Unverify user error:", error);
      toast.error("Failed to remove user verification. Please try again.");
    } finally {
      setIsUnverifying(false);
    }
  };

  const handleExportUsers = () => {
    // Create CSV content
    const headers = ["ID", "Name", "Email", "Role", "Status", "Verified", "Join Date", "Deals", "Spent"];
    const csvRows = [headers.join(",")];

    filteredUsers.forEach((user) => {
      const row = [
        user.id,
        `"${user.name}"`,
        user.email,
        user.role,
        user.status,
        user.verified ? "Yes" : "No",
        user.joinDate,
        user.deals.toString(),
        user.spent.replace("$", "").replace(",", ""),
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-slate-900 mb-1">User Management</h1>
          <p className="text-slate-600">Manage and monitor all platform users</p>
        </div>
        {permissions.export_user_data && (
          <Button onClick={handleExportUsers}>
            <Download className="mr-2 h-4 w-4" />
            Export Users
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(() => {
          const totalUsers = users.length;
          const activeUsers = users.filter(u => u.status === "Active" || u.is_active !== false).length;
          const pendingUsers = users.filter(u => u.verified === false && u.status !== "Suspended").length;
          const suspendedUsers = users.filter(u => u.status === "Suspended" || u.is_active === false).length;
          
          const activePercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : "0";
          const pendingPercentage = totalUsers > 0 ? ((pendingUsers / totalUsers) * 100).toFixed(1) : "0";
          const suspendedPercentage = totalUsers > 0 ? ((suspendedUsers / totalUsers) * 100).toFixed(1) : "0";

          return (
            <>
              <StatCard 
                label="Total Users" 
                value={totalUsers.toLocaleString()} 
                badge={totalUsers > 0 ? "+12%" : "0%"} 
                badgeVariant="success" 
              />
              <StatCard 
                label="Active Users" 
                value={activeUsers.toLocaleString()} 
                badge={`${activePercentage}%`} 
                badgeVariant="default" 
              />
              <StatCard 
                label="Pending Verification" 
                value={pendingUsers.toLocaleString()} 
                badge={`${pendingPercentage}%`} 
                badgeVariant="warning" 
              />
              <StatCard 
                label="Suspended" 
                value={suspendedUsers.toLocaleString()} 
                badge={`${suspendedPercentage}%`} 
                badgeVariant="destructive" 
              />
            </>
          );
        })()}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
                <p className="mt-4 text-slate-600">Loading users...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-slate-600">No users found</p>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
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
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                            <CircleCheck className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-green-700">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                            <CircleX className="h-4 w-4 text-slate-400" />
                          </div>
                          <span className="text-sm text-slate-500">Not Verified</span>
                        </div>
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
                          {isSuperAdmin && (
                            <DropdownMenuItem 
                              onClick={() => handleSuspendUser(user.id, user.status === "Suspended" || user.is_active === false)}
                              disabled={isSuspending}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              {user.status === "Suspended" || user.is_active === false ? "Activate User" : "Suspend User"}
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
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-semibold">User Details</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-1">
              View and manage user information and activity
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 pt-4">
              {/* User Profile Section */}
              <div className="flex items-center gap-5 pb-6 border-b">
                <Avatar className="h-20 w-20 border-2 border-slate-200">
                  <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white text-2xl font-semibold">
                    {selectedUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-slate-900 mb-1">{selectedUser.name}</h3>
                  <p className="text-sm text-slate-600 mb-3">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0">
                      {selectedUser.role}
                    </Badge>
                    <Badge
                      variant={
                        selectedUser.status === "Active" 
                          ? "default" 
                          : selectedUser.status === "Pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className="font-medium"
                    >
                      {selectedUser.status}
                    </Badge>
                    {selectedUser.verified && (
                      <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                        <CircleCheck className="mr-1.5 h-3.5 w-3.5" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
                  User Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoCard 
                    label="User ID" 
                    value={selectedUser.id}
                    className="font-mono text-xs"
                  />
                  <InfoCard 
                    label="Join Date" 
                    value={selectedUser.joinDate}
                  />
                  <InfoCard 
                    label="Total Deals" 
                    value={selectedUser.deals.toString()}
                    highlight
                  />
                  <InfoCard 
                    label="Total Spent" 
                    value={selectedUser.spent}
                    highlight
                  />
                </div>
              </div>

              {/* Action Buttons - Only for Super Admin */}
              {isSuperAdmin && (
                <div className="pt-4 border-t space-y-3">
                  {/* Verify/Unverify Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="default"
                      className="h-11 text-base font-medium bg-green-600 hover:bg-green-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => handleVerifyUser(selectedUser.id, selectedUser.verified)}
                      disabled={isVerifying || selectedUser.verified}
                    >
                      <ShieldCheck className="mr-2 h-5 w-5" />
                      {isVerifying ? "Processing..." : "Verify User"}
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-11 text-base font-medium border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => handleUnverifyUser(selectedUser.id)}
                      disabled={isUnverifying || !selectedUser.verified}
                    >
                      <ShieldCheck className="mr-2 h-5 w-5" />
                      {isUnverifying ? "Processing..." : "Unverify User"}
                    </Button>
                  </div>
                  
                  {/* Suspend/Activate Button */}
                  <Button 
                    variant={selectedUser.status === "Suspended" || selectedUser.is_active === false ? "default" : "destructive"}
                    className="w-full h-11 text-base font-medium"
                    onClick={() => handleSuspendUser(selectedUser.id, selectedUser.status === "Suspended" || selectedUser.is_active === false)}
                    disabled={isSuspending}
                  >
                    <Ban className="mr-2 h-5 w-5" />
                    {isSuspending 
                      ? "Processing..." 
                      : selectedUser.status === "Suspended" || selectedUser.is_active === false 
                        ? "Activate User" 
                        : "Suspend User"}
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
          <Badge 
            variant={
              (badgeVariant === "success" 
                ? "default" 
                : badgeVariant === "warning" 
                ? "secondary" 
                : badgeVariant === "destructive"
                ? "destructive"
                : "default") as "default" | "destructive" | "outline" | "secondary"
            }
          >
            {badge}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoCard({ 
  label, 
  value, 
  className = "",
  highlight = false 
}: { 
  label: string; 
  value: string;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'} transition-colors hover:border-slate-300`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-base font-semibold text-slate-900 ${className} ${highlight ? 'text-slate-900' : ''}`}>
        {value}
      </p>
    </div>
  );
}