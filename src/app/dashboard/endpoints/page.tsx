"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Plus,
  Copy,
  Check,
  DotsThree,
  Pencil,
  Trash,
  Pause,
  Play,
  GitlabLogoSimple,
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
import { useEndpoints, useUpdateEndpoint, useDeleteEndpoint } from "@/hooks/use-endpoints";
import { EndpointsSkeleton } from "@/features/endpoints/list-skeleton";

const statusColors = {
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
  PAUSED: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  DISABLED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export default function EndpointsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const orgSlug = "acme-inc"; // TODO: Will come from context
  
  const { data, isLoading, error } = useEndpoints();
  const updateEndpoint = useUpdateEndpoint();
  const deleteEndpoint = useDeleteEndpoint();

  const copyWebhookUrl = (slug: string, id: string) => {
    const url = `https://webhooker.app/api/webhook/${orgSlug}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Webhook URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleEndpointStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    
    try {
      await updateEndpoint.mutateAsync({
        id,
        data: { status: newStatus },
      });
      toast.success(`Endpoint ${newStatus === "ACTIVE" ? "resumed" : "paused"} successfully`);
    } catch (error) {
      toast.error("Failed to update endpoint status");
    }
  };

  const handleDeleteEndpoint = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteEndpoint.mutateAsync(id);
      toast.success("Endpoint deleted successfully");
    } catch (error) {
      toast.error("Failed to delete endpoint");
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Endpoints</h1>
            <p className="text-muted-foreground">
              Webhook URLs that receive events from your applications
            </p>
          </div>
        </div>
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive">Failed to load endpoints. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const endpoints = data?.success ? data.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Endpoints</h1>
          <p className="text-muted-foreground">
            Webhook URLs that receive events from your applications
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/endpoints/new">
            <Plus className="size-4" />
            Create Endpoint
          </Link>
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && <EndpointsSkeleton />}

      {/* Empty State */}
      {!isLoading && endpoints.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <GitlabLogoSimple className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No endpoints yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              Create your first endpoint to start receiving webhooks from GitLab
            </p>
            <Button asChild>
              <Link href="/dashboard/endpoints/new">
                <Plus className="size-4" />
                Create Endpoint
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Endpoints List */}
      {!isLoading && endpoints.length > 0 && (
        <div className="grid gap-4">
          {endpoints.map((endpoint) => (
            <Card key={endpoint.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <GitlabLogoSimple
                        className="size-5 text-orange-600"
                        weight="fill"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        <Link
                          href={`/dashboard/endpoints/${endpoint.id}`}
                          className="hover:underline"
                        >
                          {endpoint.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {endpoint.provider.displayName}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={statusColors[endpoint.status]}
                    >
                      {endpoint.status.toLowerCase()}
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
                          <Link href={`/dashboard/endpoints/${endpoint.id}/edit`}>
                            <Pencil className="size-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleEndpointStatus(endpoint.id, endpoint.status)}
                          disabled={updateEndpoint.isPending}
                        >
                          {endpoint.status === "ACTIVE" ? (
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
                          onClick={() => handleDeleteEndpoint(endpoint.id, endpoint.name)}
                          disabled={deleteEndpoint.isPending}
                        >
                          <Trash className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Webhook URL */}
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <code className="flex-1 text-xs text-muted-foreground truncate">
                    https://webhooker.app/api/webhook/{orgSlug}/{endpoint.slug}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() => copyWebhookUrl(endpoint.slug, endpoint.id)}
                  >
                    {copiedId === endpoint.id ? (
                      <Check className="size-3.5 text-green-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    <strong className="text-foreground">{endpoint._count.routes}</strong>{" "}
                    routes
                  </span>
                  <span>
                    <strong className="text-foreground">{endpoint._count.events}</strong>{" "}
                    events received
                  </span>
                  <span className="ml-auto">
                    Created {new Date(endpoint.createdAt).toLocaleDateString()}
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
