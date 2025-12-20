import { useState } from "react";
import { Search, Filter, Eye, CircleCheck, CircleX, Clock, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DataTable } from "../shared/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const deals = [
  {
    id: "D-4523",
    title: "Premium Website Development",
    buyer: "John Doe",
    seller: "Jane Smith",
    agent: "Mike Johnson",
    amount: "$5,500",
    commission: "$275",
    status: "Active",
    escrow: "Funded",
    createdDate: "2024-12-15",
  },
  {
    id: "D-4522",
    title: "Logo Design Package",
    buyer: "Sarah Williams",
    seller: "Tom Brown",
    agent: "Lisa Anderson",
    amount: "$1,200",
    commission: "$60",
    status: "Completed",
    escrow: "Released",
    createdDate: "2024-12-10",
  },
  {
    id: "D-4521",
    title: "Mobile App Development",
    buyer: "David Lee",
    seller: "Emma Wilson",
    agent: "Mike Johnson",
    amount: "$12,000",
    commission: "$600",
    status: "In Dispute",
    escrow: "Held",
    createdDate: "2024-12-08",
  },
  {
    id: "D-4520",
    title: "Content Writing - 10 Articles",
    buyer: "Alex Turner",
    seller: "Rachel Green",
    agent: "Chris Martinez",
    amount: "$800",
    commission: "$40",
    status: "Pending",
    escrow: "Awaiting",
    createdDate: "2024-12-18",
  },
];

export function DealManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDeal, setSelectedDeal] = useState<typeof deals[0] | null>(null);

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      Active: { variant: "default", className: "bg-blue-100 text-blue-700" },
      Completed: { variant: "default", className: "bg-green-100 text-green-700" },
      Pending: { variant: "default", className: "bg-yellow-100 text-yellow-700" },
      "In Dispute": { variant: "default", className: "bg-red-100 text-red-700" },
      Cancelled: { variant: "default", className: "bg-slate-100 text-slate-700" },
    };
    return (
      <Badge variant={variants[status]?.variant || "default"} className={variants[status]?.className}>
        {status}
      </Badge>
    );
  };

  const escrowBadge = (escrow: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      Funded: { variant: "default", className: "bg-green-100 text-green-700" },
      Released: { variant: "default", className: "bg-blue-100 text-blue-700" },
      Held: { variant: "default", className: "bg-red-100 text-red-700" },
      Awaiting: { variant: "default", className: "bg-yellow-100 text-yellow-700" },
    };
    return (
      <Badge variant={variants[escrow]?.variant || "outline"} className={variants[escrow]?.className}>
        {escrow}
      </Badge>
    );
  };

  const columns = [
    {
      key: "id",
      label: "Deal ID",
      render: (deal: typeof deals[0]) => (
        <span className="font-mono text-sm font-medium text-slate-900">{deal.id}</span>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (deal: typeof deals[0]) => (
        <div>
          <p className="font-medium text-slate-900">{deal.title}</p>
          <p className="text-xs text-slate-500">{deal.createdDate}</p>
        </div>
      ),
    },
    {
      key: "parties",
      label: "Parties",
      render: (deal: typeof deals[0]) => (
        <div className="text-sm">
          <p className="text-slate-600">
            <span className="text-slate-900">B:</span> {deal.buyer}
          </p>
          <p className="text-slate-600">
            <span className="text-slate-900">S:</span> {deal.seller}
          </p>
          <p className="text-slate-600">
            <span className="text-slate-900">A:</span> {deal.agent}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (deal: typeof deals[0]) => (
        <div>
          <p className="font-semibold text-slate-900">{deal.amount}</p>
          <p className="text-xs text-slate-500">Fee: {deal.commission}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (deal: typeof deals[0]) => statusBadge(deal.status),
    },
    {
      key: "escrow",
      label: "Escrow",
      render: (deal: typeof deals[0]) => escrowBadge(deal.escrow),
    },
    {
      key: "actions",
      label: "",
      render: (deal: typeof deals[0]) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedDeal(deal)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-1">Deal Management</h1>
        <p className="text-slate-600">Monitor and manage all platform deals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Deals" value="1,234" icon={CircleCheck} color="blue" />
        <StatCard label="Active Deals" value="456" icon={Clock} color="green" />
        <StatCard label="In Dispute" value="12" icon={TriangleAlert} color="red" />
        <StatCard label="Total Volume" value="$2.4M" icon={CircleCheck} color="purple" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by deal ID or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Dispute">In Dispute</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={filteredDeals} />
        </CardContent>
      </Card>

      {/* Deal Detail Dialog */}
      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deal Details</DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm text-slate-500">{selectedDeal.id}</p>
                  <h3 className="font-semibold text-slate-900 mt-1">{selectedDeal.title}</h3>
                </div>
                <div className="flex gap-2">
                  {statusBadge(selectedDeal.status)}
                  {escrowBadge(selectedDeal.escrow)}
                </div>
              </div>

              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="escrow">Escrow</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="Amount" value={selectedDeal.amount} />
                    <InfoItem label="Commission" value={selectedDeal.commission} />
                    <InfoItem label="Buyer" value={selectedDeal.buyer} />
                    <InfoItem label="Seller" value={selectedDeal.seller} />
                    <InfoItem label="Agent" value={selectedDeal.agent} />
                    <InfoItem label="Created" value={selectedDeal.createdDate} />
                  </div>
                </TabsContent>
                <TabsContent value="timeline">
                  <p className="text-sm text-slate-600">Deal timeline coming soon...</p>
                </TabsContent>
                <TabsContent value="escrow">
                  <p className="text-sm text-slate-600">Escrow details coming soon...</p>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (selectedDeal) {
                      console.log("Approve deal:", selectedDeal.id);
                      // Handle approve action
                      alert(`Deal ${selectedDeal.id} approved successfully!`);
                      setSelectedDeal(null);
                    }
                  }}
                >
                  Approve Deal
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    if (selectedDeal) {
                      const confirmed = window.confirm(
                        `Are you sure you want to cancel deal ${selectedDeal.id}?`
                      );
                      if (confirmed) {
                        console.log("Cancel deal:", selectedDeal.id);
                        // Handle cancel action
                        alert(`Deal ${selectedDeal.id} has been cancelled.`);
                        setSelectedDeal(null);
                      }
                    }
                  }}
                >
                  Cancel Deal
                </Button>
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
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}