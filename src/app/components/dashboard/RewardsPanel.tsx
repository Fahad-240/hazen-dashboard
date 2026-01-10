import { Trophy, Award, Star, Medal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const topUsers: Array<{ rank: number; name: string; points: number; badge: string }> = [];

const badges: Array<{ name: string; description: string; earned: number }> = [];

export function RewardsPanel() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-1">Rewards & Gamification</h1>
        <p className="text-slate-600">Manage leaderboards, badges, and rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Points Awarded" value="2.4M" icon={Star} />
        <StatCard label="Active Badges" value="24" icon={Award} />
        <StatCard label="Top Performers" value="156" icon={Trophy} />
        <StatCard label="Engagement Rate" value="76%" icon={Medal} />
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="definitions">Definitions</TabsTrigger>
        </TabsList>

        {/* Leaderboard */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topUsers.map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center gap-4 p-4 rounded-lg border border-slate-200"
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                        user.rank === 1
                          ? "bg-yellow-100 text-yellow-700"
                          : user.rank === 2
                          ? "bg-slate-200 text-slate-700"
                          : user.rank === 3
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.rank}
                    </div>
                    <Avatar>
                      <AvatarFallback className="bg-slate-900 text-white">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-600">{user.badge}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {user.points.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge) => (
              <Card key={badge.name}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                      <Award className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{badge.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{badge.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary">{badge.earned} earned</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Rewards */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Reward Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RewardTier name="Bronze" minPoints={0} benefits="Basic badge, profile highlight" />
                <RewardTier
                  name="Silver"
                  minPoints={5000}
                  benefits="Priority support, featured listings"
                />
                <RewardTier
                  name="Gold"
                  minPoints={10000}
                  benefits="Reduced fees, premium badge, VIP support"
                />
                <RewardTier
                  name="Platinum"
                  minPoints={25000}
                  benefits="Zero fees, exclusive events, personal account manager"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Triggers Management */}
        <TabsContent value="triggers">
          <Card>
            <CardHeader>
              <CardTitle>Reward Triggers</CardTitle>
              <CardDescription>Manage reward trigger conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Account Created</p>
                    <p className="text-sm text-slate-600">Triggered when a new user signs up</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">First Deal Completed</p>
                    <p className="text-sm text-slate-600">Triggered when user completes first deal</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Deals Milestone</p>
                    <p className="text-sm text-slate-600">Triggered at 10, 50, 100 deals</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm text-slate-500 text-center pt-4">
                  Full trigger management (create/edit/delete) coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Definitions Management */}
        <TabsContent value="definitions">
          <Card>
            <CardHeader>
              <CardTitle>Reward Definitions</CardTitle>
              <CardDescription>Manage reward types and amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Welcome Bonus</p>
                    <p className="text-sm text-slate-600">100 IMPACT tokens for new users</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">First Deal Reward</p>
                    <p className="text-sm text-slate-600">50 IMPACT tokens for first deal</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Milestone Badge</p>
                    <p className="text-sm text-slate-600">Achievement badge for milestones</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm text-slate-500 text-center pt-4">
                  Full definition management (create/edit/delete) coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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

function RewardTier({
  name,
  minPoints,
  benefits,
}: {
  name: string;
  minPoints: number;
  benefits: string;
}) {
  const colors: Record<string, string> = {
    Bronze: "bg-orange-100 text-orange-700 border-orange-200",
    Silver: "bg-slate-200 text-slate-700 border-slate-300",
    Gold: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Platinum: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colors[name]}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{name} Tier</h3>
          <p className="text-sm mt-1 opacity-80">{minPoints.toLocaleString()}+ points</p>
        </div>
        <Trophy className="h-5 w-5" />
      </div>
      <p className="text-sm mt-3 opacity-90">{benefits}</p>
    </div>
  );
}
