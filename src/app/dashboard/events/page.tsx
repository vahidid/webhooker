"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GitlabLogoSimple,
  MagnifyingGlass,
  Funnel,
  CaretDown,
  ArrowSquareOut,
  Clock,
  CheckCircle,
  XCircle,
  Hourglass,
  Warning,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data - will be replaced with real data from API
const mockEvents = [
  {
    id: "evt_1",
    endpoint: {
      id: "1",
      name: "Production GitLab",
      provider: { name: "gitlab", displayName: "GitLab" },
    },
    eventType: "Merge Request Hook",
    status: "PROCESSED" as const,
    deliveryCount: 2,
    successfulDeliveries: 2,
    receivedAt: new Date("2024-12-24T14:32:15"),
    body: {
      object_kind: "merge_request",
      event_type: "merge_request",
      object_attributes: {
        title: "Fix authentication bug",
        action: "open",
        state: "opened",
      },
    },
  },
  {
    id: "evt_2",
    endpoint: {
      id: "1",
      name: "Production GitLab",
      provider: { name: "gitlab", displayName: "GitLab" },
    },
    eventType: "Pipeline Hook",
    status: "PROCESSED" as const,
    deliveryCount: 1,
    successfulDeliveries: 1,
    receivedAt: new Date("2024-12-24T14:28:42"),
    body: {
      object_kind: "pipeline",
      object_attributes: {
        status: "success",
        ref: "main",
      },
    },
  },
  {
    id: "evt_3",
    endpoint: {
      id: "1",
      name: "Production GitLab",
      provider: { name: "gitlab", displayName: "GitLab" },
    },
    eventType: "Pipeline Hook",
    status: "ERROR" as const,
    deliveryCount: 1,
    successfulDeliveries: 0,
    receivedAt: new Date("2024-12-24T13:45:10"),
    body: {
      object_kind: "pipeline",
      object_attributes: {
        status: "failed",
        ref: "feature/new-dashboard",
      },
    },
  },
  {
    id: "evt_4",
    endpoint: {
      id: "2",
      name: "Staging GitLab",
      provider: { name: "gitlab", displayName: "GitLab" },
    },
    eventType: "Push Hook",
    status: "IGNORED" as const,
    deliveryCount: 0,
    successfulDeliveries: 0,
    receivedAt: new Date("2024-12-24T12:15:33"),
    body: {
      object_kind: "push",
      ref: "refs/heads/main",
      total_commits_count: 3,
    },
  },
  {
    id: "evt_5",
    endpoint: {
      id: "1",
      name: "Production GitLab",
      provider: { name: "gitlab", displayName: "GitLab" },
    },
    eventType: "Merge Request Hook",
    status: "PROCESSING" as const,
    deliveryCount: 2,
    successfulDeliveries: 1,
    receivedAt: new Date("2024-12-24T11:58:22"),
    body: {
      object_kind: "merge_request",
      event_type: "merge_request",
      object_attributes: {
        title: "Add user settings page",
        action: "merge",
        state: "merged",
      },
    },
  },
];

const statusConfig = {
  RECEIVED: {
    label: "Received",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: Clock,
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    icon: Hourglass,
  },
  PROCESSED: {
    label: "Processed",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: CheckCircle,
  },
  IGNORED: {
    label: "Ignored",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    icon: Warning,
  },
  INVALID: {
    label: "Invalid",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: XCircle,
  },
  ERROR: {
    label: "Error",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: XCircle,
  },
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDate(date: Date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  const filteredEvents = mockEvents.filter((event) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        event.eventType.toLowerCase().includes(query) ||
        event.endpoint.name.toLowerCase().includes(query) ||
        event.id.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilters.length > 0 && !statusFilters.includes(event.status)) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Webhook events received from your endpoints
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Funnel className="size-4" />
              Status
              {statusFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 size-5 p-0 justify-center">
                  {statusFilters.length}
                </Badge>
              )}
              <CaretDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(statusConfig).map(([status, config]) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilters.includes(status)}
                onCheckedChange={(checked) => {
                  setStatusFilters(
                    checked
                      ? [...statusFilters, status]
                      : statusFilters.filter((s) => s !== status)
                  );
                }}
              >
                {config.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Clock className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No events found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {searchQuery || statusFilters.length > 0
                ? "Try adjusting your search or filters"
                : "Events will appear here when webhooks are received"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Events</CardTitle>
            <CardDescription>
              {filteredEvents.length} event
              {filteredEvents.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredEvents.map((event) => {
                const status = statusConfig[event.status];
                const StatusIcon = status.icon;

                return (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group"
                  >
                    {/* Provider Icon */}
                    <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10 shrink-0">
                      <GitlabLogoSimple
                        className="size-5 text-orange-600"
                        weight="fill"
                      />
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {event.eventType}
                        </span>
                        <Badge variant="outline" className={status.color}>
                          <StatusIcon className="size-3 mr-1" weight="fill" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                        <span className="truncate">{event.endpoint.name}</span>
                        <span>•</span>
                        <code className="text-xs">{event.id}</code>
                      </div>
                    </div>

                    {/* Delivery Stats */}
                    <div className="text-right shrink-0">
                      <div className="text-sm">
                        {event.deliveryCount > 0 ? (
                          <span>
                            <span className="text-green-600 font-medium">
                              {event.successfulDeliveries}
                            </span>
                            <span className="text-muted-foreground">
                              /{event.deliveryCount} delivered
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            No deliveries
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(event.receivedAt)} at{" "}
                        {formatTime(event.receivedAt)}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowSquareOut className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
