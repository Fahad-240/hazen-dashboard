import { useState, useEffect } from "react";
import { PlusCircle, Edit, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { DataTable } from "../shared/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { useAuth } from "../../context/AuthContext";
import {
  getUserRewards,
  getRewardTriggers,
  createRewardTrigger,
  updateRewardTrigger,
  UserReward,
  RewardTrigger,
} from "../../services/api";
import { toast } from "sonner";

export function RewardsPanel() {
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("rewards");

  // User Rewards State
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [rewardsPage, setRewardsPage] = useState(1);
  const [rewardsPagination, setRewardsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Reward Triggers State
  const [rewardTriggers, setRewardTriggers] = useState<RewardTrigger[]>([]);
  const [isLoadingTriggers, setIsLoadingTriggers] = useState(false);
  const [triggersPage, setTriggersPage] = useState(1);
  const [triggersPagination, setTriggersPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [isEditingTrigger, setIsEditingTrigger] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<RewardTrigger | null>(null);
  const [isSavingTrigger, setIsSavingTrigger] = useState(false);

  // Trigger Form State
  const [triggerForm, setTriggerForm] = useState({
    name: "",
    description: "",
    trigger_type: "",
    reward_type: "",
    reward_value: "",
    is_active: true,
    conditions: {} as Record<string, any>,
  });

  // Fetch user rewards
  useEffect(() => {
    if (activeTab === "rewards") {
      fetchUserRewards();
    }
  }, [activeTab, rewardsPage]);

  // Fetch reward triggers
  useEffect(() => {
    if (activeTab === "triggers") {
      fetchRewardTriggers();
    }
  }, [activeTab, triggersPage]);

  const fetchUserRewards = async () => {
    setIsLoadingRewards(true);
    try {
      const response = await getUserRewards({
        page: rewardsPage,
        limit: 10,
      });

      if (response.success && response.data) {
        setUserRewards(response.data.userRewards || []);
        if (response.data.pagination) {
          setRewardsPagination(response.data.pagination);
        }
      } else {
        toast.error(response.error || "Failed to fetch user rewards");
        setUserRewards([]);
      }
    } catch (error) {
      console.error("Error fetching user rewards:", error);
      toast.error("Failed to fetch user rewards. Please try again.");
      setUserRewards([]);
    } finally {
      setIsLoadingRewards(false);
    }
  };

  const fetchRewardTriggers = async () => {
    setIsLoadingTriggers(true);
    try {
      const response = await getRewardTriggers({
        page: triggersPage,
        limit: 10,
      });

      if (response.success && response.data) {
        const triggers = response.data.rewardTriggers || [];
        console.log("Reward triggers data:", triggers);
        // Log first trigger to debug
        if (triggers.length > 0) {
          console.log("First trigger object:", triggers[0]);
          console.log("First trigger trigger_type:", triggers[0].trigger_type);
        }
        setRewardTriggers(triggers);
        if (response.data.pagination) {
          setTriggersPagination(response.data.pagination);
        }
      } else {
        toast.error(response.error || "Failed to fetch reward triggers");
        setRewardTriggers([]);
      }
    } catch (error) {
      console.error("Error fetching reward triggers:", error);
      toast.error("Failed to fetch reward triggers. Please try again.");
      setRewardTriggers([]);
    } finally {
      setIsLoadingTriggers(false);
    }
  };

  const handleCreateTrigger = () => {
    setSelectedTrigger(null);
    setIsEditingTrigger(false);
    setTriggerForm({
      name: "",
      description: "",
      trigger_type: "",
      reward_type: "",
      reward_value: "",
      is_active: true,
      conditions: {},
    });
    setShowTriggerModal(true);
  };

  const handleEditTrigger = (trigger: RewardTrigger) => {
    setSelectedTrigger(trigger);
    setIsEditingTrigger(true);
    setTriggerForm({
      name: trigger.name || "",
      description: trigger.description || "",
      trigger_type: trigger.trigger_type || "",
      reward_type: trigger.reward_type || "",
      reward_value: trigger.reward_value?.toString() || "",
      is_active: trigger.is_active !== undefined ? trigger.is_active : true,
      conditions: trigger.conditions || {},
    });
    setShowTriggerModal(true);
  };

  const handleSaveTrigger = async () => {
    if (!triggerForm.name.trim()) {
      toast.error("Please enter a trigger name");
      return;
    }
    if (!triggerForm.trigger_type) {
      toast.error("Please select a trigger type");
      return;
    }
    if (!triggerForm.reward_type) {
      toast.error("Please select a reward type");
      return;
    }
    if (!triggerForm.reward_value || parseFloat(triggerForm.reward_value) <= 0) {
      toast.error("Please enter a valid reward value");
      return;
    }

    setIsSavingTrigger(true);
    try {
      if (isEditingTrigger && selectedTrigger) {
        // Update existing trigger
        const response = await updateRewardTrigger(selectedTrigger.id, {
          name: triggerForm.name,
          description: triggerForm.description || undefined,
          trigger_type: triggerForm.trigger_type,
          reward_type: triggerForm.reward_type,
          reward_value: parseFloat(triggerForm.reward_value),
          is_active: triggerForm.is_active,
          conditions: Object.keys(triggerForm.conditions).length > 0 ? triggerForm.conditions : undefined,
        });

        if (response.success) {
          console.log("Update trigger response data:", response.data);
          toast.success(response.message || "Reward trigger updated successfully");
          setShowTriggerModal(false);
          // Reset form
          setTriggerForm({
            name: "",
            description: "",
            trigger_type: "",
            reward_type: "",
            reward_value: "",
            is_active: true,
            conditions: {},
          });
          fetchRewardTriggers();
        } else {
          toast.error(response.error || "Failed to update reward trigger");
        }
      } else {
        // Create new trigger
        const response = await createRewardTrigger({
          name: triggerForm.name,
          description: triggerForm.description || undefined,
          trigger_type: triggerForm.trigger_type,
          reward_type: triggerForm.reward_type,
          reward_value: parseFloat(triggerForm.reward_value),
          is_active: triggerForm.is_active,
          conditions: Object.keys(triggerForm.conditions).length > 0 ? triggerForm.conditions : undefined,
        });

        if (response.success) {
          console.log("Create trigger response data:", response.data);
          toast.success(response.message || "Reward trigger created successfully");
          setShowTriggerModal(false);
          // Reset form
          setTriggerForm({
            name: "",
            description: "",
            trigger_type: "",
            reward_type: "",
            reward_value: "",
            is_active: true,
            conditions: {},
          });
          fetchRewardTriggers();
        } else {
          toast.error(response.error || "Failed to create reward trigger");
        }
      }
    } catch (error) {
      console.error("Error saving reward trigger:", error);
      toast.error("Failed to save reward trigger. Please try again.");
    } finally {
      setIsSavingTrigger(false);
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      completed: { variant: "default", label: "Completed" },
      pending: { variant: "secondary", label: "Pending" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };

    const config = variants[status.toLowerCase()] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const activeBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  // User Rewards Columns
  const userRewardsColumns = [
    {
      key: "reward_name",
      label: "Reward Name",
      render: (reward: UserReward) => (
        <div className="font-medium text-slate-900">{reward.reward_name}</div>
      ),
    },
    {
      key: "user_id",
      label: "User ID",
      render: (reward: UserReward) => (
        <div className="text-sm text-slate-600 font-mono">{reward.user_id.substring(0, 8)}...</div>
      ),
    },
    {
      key: "reward_type",
      label: "Type",
      render: (reward: UserReward) => (
        <Badge variant="outline" className="capitalize">
          {reward.reward_type}
        </Badge>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (reward: UserReward) => (
        <div className="font-semibold text-slate-900">{reward.amount.toLocaleString()}</div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (reward: UserReward) => statusBadge(reward.status),
    },
  ];

  // Reward Triggers Columns
  const rewardTriggersColumns = [
    {
      key: "name",
      label: "Name",
      render: (trigger: RewardTrigger) => (
        <div>
          <div className="font-medium text-slate-900">{trigger.name}</div>
          {trigger.description && (
            <div className="text-sm text-slate-600 mt-1">{trigger.description}</div>
          )}
        </div>
      ),
    },
    {
      key: "trigger_type",
      label: "Trigger Type",
      render: (trigger: RewardTrigger) => {
        // Handle different possible field names and formats
        const triggerType = trigger.trigger_type || (trigger as any).triggerType || "";
        console.log("Trigger object in render:", trigger);
        console.log("Trigger type value:", triggerType);
        
        if (!triggerType || triggerType === "") {
          return (
            <Badge variant="outline" className="text-slate-400">
              Not Set
            </Badge>
          );
        }
        
        // Format the trigger type for display
        const displayValue = triggerType
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase())
          .trim();
        
        return (
          <Badge variant="outline" className="capitalize">
            {displayValue}
          </Badge>
        );
      },
    },
    {
      key: "reward_type",
      label: "Reward Type",
      render: (trigger: RewardTrigger) => (
        <Badge variant="outline" className="capitalize">
          {trigger.reward_type || "-"}
        </Badge>
      ),
    },
    {
      key: "reward_value",
      label: "Reward Value",
      render: (trigger: RewardTrigger) => (
        <div className="font-semibold text-slate-900">
          {trigger.reward_value?.toLocaleString() || "-"}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (trigger: RewardTrigger) => activeBadge(trigger.is_active),
    },
    {
      key: "actions",
      label: "Actions",
      render: (trigger: RewardTrigger) => (
        <div className="flex gap-2">
          {isSuperAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditTrigger(trigger)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-1">Rewards & Gamification</h1>
        <p className="text-slate-600">Manage user rewards and reward triggers</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="rewards">User Rewards</TabsTrigger>
          <TabsTrigger value="triggers">Reward Triggers</TabsTrigger>
        </TabsList>

        {/* User Rewards */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>User Rewards</CardTitle>
              <CardDescription>View all rewards earned by users</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRewards ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <DataTable
                  columns={userRewardsColumns}
                  data={userRewards}
                  currentPage={rewardsPagination.page}
                  totalPages={rewardsPagination.totalPages}
                  onPageChange={setRewardsPage}
                  emptyMessage="No user rewards found"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reward Triggers */}
        <TabsContent value="triggers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reward Triggers</CardTitle>
                  <CardDescription>Manage reward trigger conditions</CardDescription>
                </div>
                {isSuperAdmin && (
                  <Button onClick={handleCreateTrigger}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Trigger
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTriggers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <DataTable
                  columns={rewardTriggersColumns}
                  data={rewardTriggers}
                  currentPage={triggersPagination.page}
                  totalPages={triggersPagination.totalPages}
                  onPageChange={setTriggersPage}
                  emptyMessage="No reward triggers found"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Reward Trigger Modal */}
      <Dialog open={showTriggerModal} onOpenChange={setShowTriggerModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingTrigger ? "Edit Reward Trigger" : "Create Reward Trigger"}
            </DialogTitle>
            <DialogDescription>
              {isEditingTrigger
                ? "Update the reward trigger details"
                : "Create a new reward trigger that automatically awards users when conditions are met"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Trigger Name *</Label>
              <Input
                id="name"
                value={triggerForm.name}
                onChange={(e) => setTriggerForm({ ...triggerForm, name: e.target.value })}
                placeholder="e.g., First Gig Completed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={triggerForm.description}
                onChange={(e) => setTriggerForm({ ...triggerForm, description: e.target.value })}
                placeholder="Describe when this trigger activates"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trigger_type">Trigger Type *</Label>
                <Select
                  value={triggerForm.trigger_type}
                  onValueChange={(value) => setTriggerForm({ ...triggerForm, trigger_type: value })}
                >
                  <SelectTrigger id="trigger_type">
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gig_completed">Gig Completed</SelectItem>
                    <SelectItem value="deal_completed">Deal Completed</SelectItem>
                    <SelectItem value="account_created">Account Created</SelectItem>
                    <SelectItem value="milestone_reached">Milestone Reached</SelectItem>
                    <SelectItem value="rating_achieved">Rating Achieved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward_type">Reward Type *</Label>
                <Select
                  value={triggerForm.reward_type}
                  onValueChange={(value) => setTriggerForm({ ...triggerForm, reward_type: value })}
                >
                  <SelectTrigger id="reward_type">
                    <SelectValue placeholder="Select reward type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Points</SelectItem>
                    <SelectItem value="badge">Badge</SelectItem>
                    <SelectItem value="tokens">Tokens</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward_value">Reward Value *</Label>
              <Input
                id="reward_value"
                type="number"
                min="0"
                value={triggerForm.reward_value}
                onChange={(e) => setTriggerForm({ ...triggerForm, reward_value: e.target.value })}
                placeholder="e.g., 100"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-slate-500">Enable or disable this trigger</p>
              </div>
              <Switch
                id="is_active"
                checked={triggerForm.is_active}
                onCheckedChange={(checked) => setTriggerForm({ ...triggerForm, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTriggerModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTrigger} disabled={isSavingTrigger}>
              {isSavingTrigger ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                isEditingTrigger ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
