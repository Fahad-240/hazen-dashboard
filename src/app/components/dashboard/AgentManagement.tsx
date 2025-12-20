import { useState } from "react";
import { Trophy, Users, DollarSign, TrendingUp, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { DataTable } from "../shared/DataTable";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
} from "../ui/dialog";

const initialAgents = [
  {
    id: "1",
    name: "Mike Johnson",
    email: "mike.j@example.com",
    tier: "Gold",
    deals: 156,
    recruits: 12,
    earnings: "$28,450",
    status: "Active",
  },
  {
    id: "2",
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    tier: "Silver",
    deals: 89,
    recruits: 5,
    earnings: "$15,230",
    status: "Active",
  },
  {
    id: "3",
    name: "Chris Martinez",
    email: "chris.m@example.com",
    tier: "Bronze",
    deals: 45,
    recruits: 2,
    earnings: "$7,890",
    status: "Active",
  },
];

export function AgentManagement() {
  const [agents, setAgents] = useState(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<typeof agents[0] | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    tier: "Gold",
    status: "Active",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(agents.length / itemsPerPage);
  const paginatedAgents = agents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const tierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      Gold: "bg-yellow-100 text-yellow-700",
      Silver: "bg-slate-200 text-slate-700",
      Bronze: "bg-orange-100 text-orange-700",
    };
    return <Badge className={colors[tier]}>{tier}</Badge>;
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Active: "bg-green-100 text-green-700",
      Suspended: "bg-red-100 text-red-700",
      Inactive: "bg-slate-100 text-slate-700",
    };
    return <Badge className={colors[status] || "bg-slate-100 text-slate-700"}>{status}</Badge>;
  };

  const columns = [
    {
      key: "agent",
      label: "Agent",
      render: (agent: typeof agents[0]) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-slate-900 text-white">
              {agent.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900">{agent.name}</p>
            <p className="text-xs text-slate-500">{agent.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "tier",
      label: "Tier",
      render: (agent: typeof agents[0]) => tierBadge(agent.tier),
    },
    {
      key: "deals",
      label: "Deals",
      render: (agent: typeof agents[0]) => (
        <span className="font-medium text-slate-900">{agent.deals}</span>
      ),
    },
    {
      key: "recruits",
      label: "Recruits",
      render: (agent: typeof agents[0]) => (
        <span className="font-medium text-slate-900">{agent.recruits}</span>
      ),
    },
    {
      key: "earnings",
      label: "Earnings",
      render: (agent: typeof agents[0]) => (
        <span className="font-semibold text-slate-900">{agent.earnings}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (agent: typeof agents[0]) => statusBadge(agent.status),
    },
    {
      key: "actions",
      label: "",
      render: (agent: typeof agents[0]) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedAgent(agent)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-1">Agent Management</h1>
        <p className="text-slate-600">Monitor agent performance and recruitment</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Agents" value="1,560" icon={Users} />
        <StatCard label="Active Agents" value="1,234" icon={TrendingUp} />
        <StatCard label="Total Earnings" value="$890,450" icon={DollarSign} />
        <StatCard label="Avg. Deals/Agent" value="67" icon={Trophy} />
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={paginatedAgents}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Agent Detail Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agent Details</DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-slate-900 text-white text-lg">
                    {selectedAgent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {selectedAgent.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedAgent.email}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {tierBadge(selectedAgent.tier)}
                    {statusBadge(selectedAgent.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-slate-600">Total Deals</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {selectedAgent.deals}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Recruits</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {selectedAgent.recruits}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Earnings</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {selectedAgent.earnings}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Agent ID</p>
                  <p className="font-mono text-sm text-slate-900 mt-1">
                    {selectedAgent.id}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (selectedAgent) {
                      setEditFormData({
                        name: selectedAgent.name,
                        email: selectedAgent.email,
                        tier: selectedAgent.tier,
                        status: selectedAgent.status,
                      });
                      setIsEditMode(true);
                    }
                  }}
                >
                  Edit Agent
                </Button>
                <Button
                  type="button"
                  variant={selectedAgent?.status === "Suspended" ? "default" : "destructive"}
                  className="flex-1"
                  onClick={() => {
                    if (selectedAgent) {
                      if (selectedAgent.status === "Suspended") {
                        // Reactivate agent
                        const confirmed = window.confirm(
                          `Are you sure you want to reactivate agent ${selectedAgent.name} (ID: ${selectedAgent.id})?`
                        );
                        if (confirmed) {
                          setAgents((prevAgents) =>
                            prevAgents.map((agent) =>
                              agent.id === selectedAgent.id
                                ? { ...agent, status: "Active" }
                                : agent
                            )
                          );
                          setSelectedAgent({ ...selectedAgent, status: "Active" });
                          console.log("Reactivate agent:", selectedAgent.id);
                          alert(`Agent ${selectedAgent.name} has been reactivated.`);
                        }
                      } else {
                        // Suspend agent
                        const confirmed = window.confirm(
                          `Are you sure you want to suspend agent ${selectedAgent.name} (ID: ${selectedAgent.id})?`
                        );
                        if (confirmed) {
                          setAgents((prevAgents) =>
                            prevAgents.map((agent) =>
                              agent.id === selectedAgent.id
                                ? { ...agent, status: "Suspended" }
                                : agent
                            )
                          );
                          setSelectedAgent({ ...selectedAgent, status: "Suspended" });
                          console.log("Suspend agent:", selectedAgent.id);
                          alert(`Agent ${selectedAgent.name} has been suspended.`);
                        }
                      }
                    }
                  }}
                >
                  {selectedAgent?.status === "Suspended" ? "Reactivate Agent" : "Suspend Agent"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Agent Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                placeholder="Enter agent name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tier">Tier</Label>
              <Select
                value={editFormData.tier}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, tier: value })
                }
              >
                <SelectTrigger id="edit-tier">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, status: value })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsEditMode(false);
                  setEditFormData({
                    name: "",
                    email: "",
                    tier: "Gold",
                    status: "Active",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => {
                  if (selectedAgent) {
                    // Update agent in state
                    setAgents((prevAgents) =>
                      prevAgents.map((agent) =>
                        agent.id === selectedAgent.id
                          ? {
                              ...agent,
                              name: editFormData.name,
                              email: editFormData.email,
                              tier: editFormData.tier,
                              status: editFormData.status,
                            }
                          : agent
                      )
                    );
                    // Update selected agent
                    setSelectedAgent({
                      ...selectedAgent,
                      name: editFormData.name,
                      email: editFormData.email,
                      tier: editFormData.tier,
                      status: editFormData.status,
                    });
                    setIsEditMode(false);
                    alert("Agent details updated successfully!");
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-slate-900 mt-1">{value}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
