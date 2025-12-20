import { Save, Shield, Bell, Palette, Database, Key } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function SettingsPanel() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-1">Settings</h1>
        <p className="text-slate-600">Manage system configuration and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="Source Impact" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" defaultValue="support@sourceimpact.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-url">Platform URL</Label>
                <Input id="platform-url" defaultValue="https://sourceimpact.com" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Maintenance Mode</p>
                  <p className="text-sm text-slate-600">Temporarily disable platform access</p>
                </div>
                <Switch />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage deal and gig categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <CategoryBadge label="Web Development" />
                <CategoryBadge label="Design" />
                <CategoryBadge label="Marketing" />
                <CategoryBadge label="Writing" />
                <CategoryBadge label="Consulting" />
              </div>
              <Button variant="outline">Add Category</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeatureToggle
                title="User Registration"
                description="Allow new users to sign up"
                defaultChecked={true}
              />
              <FeatureToggle
                title="Deal Creation"
                description="Allow users to create new deals"
                defaultChecked={true}
              />
              <FeatureToggle
                title="Gig Marketplace"
                description="Enable the gig marketplace feature"
                defaultChecked={true}
              />
              <FeatureToggle
                title="Agent Recruitment"
                description="Allow agents to recruit other agents"
                defaultChecked={false}
              />
              <FeatureToggle
                title="Rewards Program"
                description="Enable badges and leaderboards"
                defaultChecked={true}
              />
              <FeatureToggle
                title="Two-Factor Authentication"
                description="Require 2FA for admin accounts"
                defaultChecked={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure automated email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle title="New User Registration" defaultChecked={true} />
              <NotificationToggle title="Deal Created" defaultChecked={true} />
              <NotificationToggle title="Deal Completed" defaultChecked={true} />
              <NotificationToggle title="Dispute Opened" defaultChecked={true} />
              <NotificationToggle title="Payout Requested" defaultChecked={true} />
              <NotificationToggle title="Daily Summary" defaultChecked={false} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Alerts</CardTitle>
              <CardDescription>Real-time alerts for admin team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle title="Fraud Detection" defaultChecked={true} />
              <NotificationToggle title="System Errors" defaultChecked={true} />
              <NotificationToggle title="High-Value Transactions" defaultChecked={true} />
              <NotificationToggle title="Suspicious Activity" defaultChecked={true} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commission Settings</CardTitle>
              <CardDescription>Configure platform fees and commissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-fee">Platform Fee (%)</Label>
                  <Input id="platform-fee" type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-commission">Agent Commission (%)</Label>
                  <Input id="agent-commission" type="number" defaultValue="3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-payout">Minimum Payout ($)</Label>
                  <Input id="min-payout" type="number" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout-frequency">Payout Frequency</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeatureToggle
                title="Enforce Strong Passwords"
                description="Require complex passwords for all users"
                defaultChecked={true}
              />
              <FeatureToggle
                title="Session Timeout"
                description="Auto-logout after 30 minutes of inactivity"
                defaultChecked={true}
              />
              <FeatureToggle
                title="IP Whitelisting"
                description="Restrict admin access to specific IP addresses"
                defaultChecked={false}
              />
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">Maximum Login Attempts</Label>
                <Input id="max-login-attempts" type="number" defaultValue="5" />
              </div>
              <Button variant="destructive">
                <Key className="mr-2 h-4 w-4" />
                Reset All User Sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FeatureToggle({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function NotificationToggle({ title, defaultChecked }: { title: string; defaultChecked: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <Label htmlFor={title} className="font-normal cursor-pointer">
        {title}
      </Label>
      <Switch id={title} defaultChecked={defaultChecked} />
    </div>
  );
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md">
      <span className="text-sm text-slate-900">{label}</span>
      <button className="text-slate-500 hover:text-slate-700">×</button>
    </div>
  );
}
