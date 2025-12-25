import { getCurrentOrganization } from "@/lib/actions/organization";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ChartLine, Bell, Users } from "@phosphor-icons/react/dist/ssr";

export default async function DashboardPage() {
  const session = await auth();
  const currentOrg = await getCurrentOrganization();

  const stats = [
    {
      title: "Total Webhooks",
      value: "0",
      description: "Active webhooks",
      icon: Globe,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Requests Today",
      value: "0",
      description: "Webhook requests",
      icon: ChartLine,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Notifications",
      value: "0",
      description: "Unread alerts",
      icon: Bell,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Team Members",
      value: currentOrg?.memberCount?.toString() || "1",
      description: "In organization",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with {currentOrg?.name || "your organization"} today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`size-4 ${stat.color}`} weight="duotone" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Complete these steps to set up your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Globe className="size-5 text-primary" weight="duotone" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Create your first webhook</h3>
                <p className="text-sm text-muted-foreground">
                  Set up a webhook endpoint to start receiving events
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="size-5 text-primary" weight="duotone" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Invite team members</h3>
                <p className="text-sm text-muted-foreground">
                  Collaborate with your team on webhook management
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
