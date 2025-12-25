"use client";

import Link from "next/link";
import {
  Plus,
  DotsThree,
  Pencil,
  Trash,
  Pause,
  Play,
  GitlabLogoSimple,
  TelegramLogo,
  ArrowRight,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data - will be replaced with real data from API
const mockRoutes = [
  {
    id: "1",
    name: "Merge Requests to Dev Team",
    status: "ACTIVE" as const,
    endpoint: {
      id: "1",
      name: "Production GitLab",
      provider: { name: "gitlab", displayName: "GitLab" },
    },
    channel: {
      id: "1",
      name: "Dev Team Notifications",
      type: "TELEGRAM",
    },
    filterExpression: "$.headers['x-gitlab-event'] == 'Merge Request Hook'",
    template: { id: "1", name: "MR Notification" },
    retryStrategy: "EXPONENTIAL" as const,
    retryCount: 5,
    deliveryCount: 89,
    successRate: 98.2,
    createdAt: new Date("2024-12-19"),
  },
  {
    id: "2",
    name: "Pipeline Failures Alert",
    status: "ACTIVE" as const,
    endpoint: {
      id: "1",
      name: "Production GitLab",
      provider: { name: "gitlab", displayName: "GitLab" },
    },
    channel: {
      id: "2",
      name: "Alerts Channel",
      type: "TELEGRAM",
    },
    filterExpression:
      "$.headers['x-gitlab-event'] == 'Pipeline Hook' && $.body.object_attributes.status == 'failed'",
    template: null,
    retryStrategy: "EXPONENTIAL" as const,
    retryCount: 3,
    deliveryCount: 23,
    successRate: 100,
    createdAt: new Date("2024-12-20"),
  },
  {
    id: "3",
    name: "All Events to Staging",
    status: "PAUSED" as const,
    endpoint: {
      id: "2",
      name: "Staging GitLab",
      provider: { name: "gitlab", displayName: "GitLab" },
    },
    channel: {
      id: "3",
      name: "Staging Notifications",
      type: "TELEGRAM",
    },
    filterExpression: null,
    template: null,
    retryStrategy: "NONE" as const,
    retryCount: 0,
    deliveryCount: 12,
    successRate: 91.7,
    createdAt: new Date("2024-12-22"),
  },
];

const statusColors = {
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
  PAUSED: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  DISABLED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const retryStrategyLabels = {
  NONE: "No retries",
  LINEAR: "Linear",
  EXPONENTIAL: "Exponential",
};

export default function RoutesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Routes</h1>
          <p className="text-muted-foreground">
            Connect endpoints to channels with filtering and transformation
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/routes/new">
            <Plus className="size-4" />
            Create Route
          </Link>
        </Button>
      </div>

      {/* Routes List */}
      {mockRoutes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <ArrowRight className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No routes yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              Create your first route to connect an endpoint to a channel
            </p>
            <Button asChild>
              <Link href="/dashboard/routes/new">
                <Plus className="size-4" />
                Create Route
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mockRoutes.map((route) => (
            <Card key={route.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      <Link
                        href={`/dashboard/routes/${route.id}`}
                        className="hover:underline"
                      >
                        {route.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {route.filterExpression ? (
                        <code className="text-xs">
                          Filter: {route.filterExpression.substring(0, 50)}
                          {route.filterExpression.length > 50 ? "..." : ""}
                        </code>
                      ) : (
                        "No filter — all events"
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={statusColors[route.status]}
                    >
                      {route.status.toLowerCase()}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <DotsThree className="size-4" weight="bold" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/routes/${route.id}`}>
                            <Pencil className="size-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {route.status === "ACTIVE" ? (
                            <>
                              <Pause className="size-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="size-4" />
                              Resume
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route Flow Visualization */}
                <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                  {/* Source Endpoint */}
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex size-8 items-center justify-center rounded-md bg-orange-500/10">
                      <GitlabLogoSimple
                        className="size-4 text-orange-600"
                        weight="fill"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {route.endpoint.name}
                      </p>
                      <p className="text-xs text-muted-foreground">Endpoint</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <div className="h-px w-4 bg-border" />
                    <ArrowRight className="size-4" />
                    <div className="h-px w-4 bg-border" />
                  </div>

                  {/* Destination Channel */}
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="min-w-0 text-right">
                      <p className="text-sm font-medium truncate">
                        {route.channel.name}
                      </p>
                      <p className="text-xs text-muted-foreground">Channel</p>
                    </div>
                    <div className="flex size-8 items-center justify-center rounded-md bg-sky-500/10">
                      <TelegramLogo
                        className="size-4 text-sky-500"
                        weight="fill"
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    <strong className="text-foreground">
                      {route.deliveryCount}
                    </strong>{" "}
                    deliveries
                  </span>
                  <span>
                    <strong className="text-foreground">
                      {route.successRate}%
                    </strong>{" "}
                    success rate
                  </span>
                  <span>{retryStrategyLabels[route.retryStrategy]}</span>
                  {route.template && (
                    <Badge variant="secondary" className="text-xs">
                      {route.template.name}
                    </Badge>
                  )}
                  <span className="ml-auto">
                    Created {route.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
