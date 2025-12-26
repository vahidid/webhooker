"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  DotsThree,
  Pencil,
  Trash,
  Pause,
  Play,
  ArrowRight,
  SpinnerGap,
  Warning,
} from "@phosphor-icons/react";
import { toast } from "sonner";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRoutes, useDeleteRoute, useUpdateRoute } from "@/hooks/use-routes";
import { cn } from "@/lib/utils";

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

const channelTypeConfig: Record<string, { color: string; bgColor: string }> = {
  TELEGRAM: { color: "text-sky-500", bgColor: "bg-sky-500/10" },
  SLACK: { color: "text-purple-500", bgColor: "bg-purple-500/10" },
  DISCORD: { color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  WEBHOOK: { color: "text-gray-500", bgColor: "bg-gray-500/10" },
  ROCKETCHAT: { color: "text-red-500", bgColor: "bg-red-500/10" },
  MATTERMOST: { color: "text-blue-500", bgColor: "bg-blue-500/10" },
  MICROSOFT_TEAMS: { color: "text-purple-600", bgColor: "bg-purple-600/10" },
  EMAIL: { color: "text-green-500", bgColor: "bg-green-500/10" },
};

export default function RoutesPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);

  const { data: routesData, isLoading, error } = useRoutes();
  const deleteRoute = useDeleteRoute();
  const updateRoute = useUpdateRoute();

  const routes = routesData?.success ? routesData.data : [];

  const handleDelete = async () => {
    if (!routeToDelete) return;

    try {
      await deleteRoute.mutateAsync(routeToDelete);
      toast.success("Route deleted successfully");
      setDeleteDialogOpen(false);
      setRouteToDelete(null);
    } catch (error) {
      toast.error("Failed to delete route");
      console.error("Delete route error:", error);
    }
  };

  const handleToggleStatus = async (
    routeId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";

    try {
      await updateRoute.mutateAsync({
        id: routeId,
        data: { status: newStatus as "ACTIVE" | "PAUSED" },
      });
      toast.success(
        `Route ${newStatus === "ACTIVE" ? "resumed" : "paused"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update route status");
      console.error("Update route status error:", error);
    }
  };

  const getProviderIcon = (provider: { iconUrl: string | null; displayName: string }) => {
    if (provider?.iconUrl) {
      return (
        <Image
          src={provider.iconUrl}
          alt={provider.displayName}
          width={16}
          height={16}
          className="size-4"
        />
      );
    }
    return (
      <span className="text-xs font-bold">
        {provider?.displayName?.charAt(0) || "?"}
      </span>
    );
  };

  const getChannelConfig = (type: string) => {
    return (
      channelTypeConfig[type] || {
        color: "text-gray-500",
        bgColor: "bg-gray-500/10",
      }
    );
  };
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
      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <SpinnerGap className="size-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading routes...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <Warning className="size-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Failed to load routes</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          </CardContent>
        </Card>
      ) : routes.length === 0 ? (
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
          {routes.map((route) => (
            <Card key={route.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">
                      <Link
                        href={`/dashboard/routes/${route.id}`}
                        className="hover:underline"
                      >
                        {route.name}
                      </Link>
                    </CardTitle>
                    {route.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {route.description}
                      </p>
                    )}
                    <CardDescription className="text-xs mt-2">
                      <Badge variant="secondary" className="mr-2 font-mono text-xs">
                        {route.eventType}
                      </Badge>
                      {route.filterExpression ? (
                        <code className="text-xs">
                          {route.filterExpression.substring(0, 60)}
                          {route.filterExpression.length > 60 ? "..." : ""}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">All {route.eventType} events</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={statusColors[route.status as keyof typeof statusColors]}
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
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(route.id, route.status)}
                        >
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
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setRouteToDelete(route.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
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
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted shrink-0">
                      {getProviderIcon(route.endpoint.provider)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {route.endpoint.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {route.endpoint.provider?.displayName}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                    <div className="h-px w-4 bg-border" />
                    <ArrowRight className="size-4" />
                    <div className="h-px w-4 bg-border" />
                  </div>

                  {/* Destination Channel */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <div className="min-w-0 flex-1 text-right">
                      <p className="text-sm font-medium truncate">
                        {route.channel.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {route.channel.type}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md shrink-0",
                        getChannelConfig(route.channel.type).bgColor
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-bold",
                          getChannelConfig(route.channel.type).color
                        )}
                      >
                        {route.channel.type.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span>
                    <strong className="text-foreground">
                      {route._count.deliveries}
                    </strong>{" "}
                    deliveries
                  </span>
                  <span>
                    Retry: {retryStrategyLabels[route.retryStrategy as keyof typeof retryStrategyLabels]}
                    {route.retryCount > 0 && ` (${route.retryCount}×)`}
                  </span>
                  {route.delaySeconds > 0 && (
                    <span>Delay: {route.delaySeconds}s</span>
                  )}
                  {route.priority > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Priority: {route.priority}
                    </Badge>
                  )}
                  {route.template && (
                    <Badge variant="secondary" className="text-xs">
                      Template: {route.template.name}
                    </Badge>
                  )}
                  <span className="ml-auto">
                    Created {new Date(route.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this route? This action cannot be
              undone. All associated deliveries will be preserved for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRoute.isPending ? (
                <>
                  <SpinnerGap className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
