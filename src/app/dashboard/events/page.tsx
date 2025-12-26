"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
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

import { useEvents } from "@/hooks/use-events";
import type { EventWithRelations } from "@/services/event.service";
import type { EventStatus } from "@/generated/prisma/client";

/**
 * Type definitions
 */
type EventStatusKey = EventStatus;

interface StatusConfig {
  label: string;
  color: string;
  icon: Icon;
}

type StatusConfigMap = Record<EventStatusKey, StatusConfig>;

/**
 * Constants
 */
const STATUS_CONFIG: StatusConfigMap = {
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
} as const;

/**
 * Utility functions
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Component: Empty State
 */
interface EmptyStateProps {
  icon: Icon;
  title: string;
  description: string;
}

function EmptyState({ icon: IconComponent, title, description }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <IconComponent className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Component: Event List Item
 */
interface EventListItemProps {
  event: EventWithRelations;
}

function EventListItem({ event }: EventListItemProps) {
  const statusKey = event.status as EventStatusKey;
  const status = STATUS_CONFIG[statusKey];
  const StatusIcon = status.icon;
  const receivedDate = new Date(event.receivedAt);

  return (
    <Link
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
          {event._count?.deliveries > 0 ? (
            <span className="text-muted-foreground">
              {event._count.deliveries} {event._count.deliveries === 1 ? "delivery" : "deliveries"}
            </span>
          ) : (
            <span className="text-muted-foreground">No deliveries</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(receivedDate)} at {formatTime(receivedDate)}
        </div>
      </div>

      {/* Arrow */}
      <ArrowSquareOut className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  );
}

/**
 * Main Component
 */
export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<EventStatusKey[]>([]);

  const { data, isLoading, isError } = useEvents();

  // Extract events from paginated response
  const events = useMemo<EventWithRelations[]>(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => (page.success ? page.data.data : []));
  }, [data]);

  // Filter events based on search query and status filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
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
  }, [events, searchQuery, statusFilters]);

  // Handle status filter toggle
  const handleStatusFilterChange = useCallback(
    (status: EventStatusKey, checked: boolean) => {
      setStatusFilters((prev) =>
        checked
          ? [...prev, status]
          : prev.filter((s) => s !== status)
      );
    },
    []
  );

  // Determine empty state message
  const emptyStateMessage = useMemo(() => {
    if (searchQuery || statusFilters.length > 0) {
      return "Try adjusting your search or filters";
    }
    return "Events will appear here when webhooks are received";
  }, [searchQuery, statusFilters.length]);

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
            {(Object.entries(STATUS_CONFIG) as [EventStatusKey, StatusConfig][]).map(([status, config]) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilters.includes(status)}
                onCheckedChange={(checked) => handleStatusFilterChange(status, checked)}
              >
                {config.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Events List */}
      {isLoading ? (
        <EmptyState
          icon={Clock}
          title="Loading events…"
          description="Fetching the latest webhook events"
        />
      ) : isError ? (
        <EmptyState
          icon={Warning}
          title="Failed to load"
          description="Please refresh or try again later"
        />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No events found"
          description={emptyStateMessage}
        />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Events</CardTitle>
            <CardDescription>
              {filteredEvents.length} event{filteredEvents.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredEvents.map((event) => (
                <EventListItem key={event.id} event={event} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
