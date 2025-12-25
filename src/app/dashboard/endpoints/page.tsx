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
const mockEndpoints = [
  {
    id: "1",
    name: "Production GitLab",
    slug: "production-gitlab",
    provider: { name: "gitlab", displayName: "GitLab" },
    status: "ACTIVE" as const,
    routeCount: 2,
    eventCount: 156,
    createdAt: new Date("2024-12-20"),
  },
  {
    id: "2",
    name: "Staging GitLab",
    slug: "staging-gitlab",
    provider: { name: "gitlab", displayName: "GitLab" },
    status: "PAUSED" as const,
    routeCount: 1,
    eventCount: 42,
    createdAt: new Date("2024-12-22"),
  },
];

const statusColors = {
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
  PAUSED: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  DISABLED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export default function EndpointsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const orgSlug = "acme-inc"; // Will come from context

  const copyWebhookUrl = (endpoint: (typeof mockEndpoints)[0]) => {
    const url = `https://webhooker.app/api/webhook/${orgSlug}/${endpoint.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(endpoint.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

      {/* Endpoints List */}
      {mockEndpoints.length === 0 ? (
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
      ) : (
        <div className="grid gap-4">
          {mockEndpoints.map((endpoint) => (
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
                          <Link href={`/dashboard/endpoints/${endpoint.id}`}>
                            <Pencil className="size-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
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
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
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
                    onClick={() => copyWebhookUrl(endpoint)}
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
                    <strong className="text-foreground">{endpoint.routeCount}</strong>{" "}
                    routes
                  </span>
                  <span>
                    <strong className="text-foreground">{endpoint.eventCount}</strong>{" "}
                    events received
                  </span>
                  <span className="ml-auto">
                    Created {endpoint.createdAt.toLocaleDateString()}
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
