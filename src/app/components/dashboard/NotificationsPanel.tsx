import { Send, Bell, Mail, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";

const recentNotifications: Array<{
  id: string;
  title: string;
  recipient: string;
  sent: string;
  status: string;
  type: string;
}> = [];

export function NotificationsPanel() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-1">Notifications</h1>
        <p className="text-slate-600">Send and manage platform notifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sent" value="12,345" icon={Send} />
        <StatCard label="Email Sent" value="8,234" icon={Mail} />
        <StatCard label="Push Sent" value="4,111" icon={Bell} />
        <StatCard label="Recipients" value="7,915" icon={Users} />
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Send Notification */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Send Notification</CardTitle>
              <CardDescription>Create and send a notification to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-type">Notification Type</Label>
                  <Select>
                    <SelectTrigger id="notification-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient-group">Recipient Group</Label>
                  <Select>
                    <SelectTrigger id="recipient-group">
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="buyers">Buyers</SelectItem>
                      <SelectItem value="sellers">Sellers</SelectItem>
                      <SelectItem value="agents">Agents</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Enter notification subject" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter notification message"
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Send Now
                </Button>
                <Button variant="outline">Schedule for Later</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <TemplateItem
                  title="Welcome Email"
                  description="Sent to new users upon registration"
                />
                <TemplateItem
                  title="Deal Created"
                  description="Confirmation when a new deal is created"
                />
                <TemplateItem
                  title="Payment Received"
                  description="Notification when payment is processed"
                />
                <TemplateItem
                  title="Deal Completed"
                  description="Sent when a deal is successfully completed"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNotifications.map((notification) => (
                  <NotificationHistoryItem key={notification.id} {...notification} />
                ))}
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

function TemplateItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-600 mt-0.5">{description}</p>
      </div>
      <Button variant="outline" size="sm">
        Edit
      </Button>
    </div>
  );
}

function NotificationHistoryItem({
  title,
  recipient,
  sent,
  status,
  type,
}: {
  title: string;
  recipient: string;
  sent: string;
  status: string;
  type: string;
}) {
  return (
    <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900">{title}</p>
          <Badge variant="outline">{type}</Badge>
          <Badge
            variant={status === "Sent" ? "default" : "secondary"}
            className={status === "Sent" ? "bg-green-100 text-green-700" : ""}
          >
            {status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
          <span>To: {recipient}</span>
          <span>•</span>
          <span>{sent}</span>
        </div>
      </div>
    </div>
  );
}
