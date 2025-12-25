"use client";

import Link from "next/link";
import {
  Plus,
  DotsThree,
  Pencil,
  Trash,
  Pause,
  Play,
  TelegramLogo,
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
const mockChannels = [
  {
    id: "1",
    name: "Dev Team Notifications",
    type: "TELEGRAM" as const,
    status: "ACTIVE" as const,
    config: { chatId: "-100123456789" },
    routeCount: 3,
    deliveryCount: 234,
    createdAt: new Date("2024-12-18"),
  },
  {
    id: "2",
    name: "Alerts Channel",
    type: "TELEGRAM" as const,
    status: "ACTIVE" as const,
    config: { chatId: "-100987654321", threadId: "5" },
    routeCount: 1,
    deliveryCount: 45,
    createdAt: new Date("2024-12-21"),
  },
  {
    id: "3",
    name: "Staging Notifications",
    type: "TELEGRAM" as const,
    status: "PAUSED" as const,
    config: { chatId: "-100555666777" },
    routeCount: 1,
    deliveryCount: 12,
    createdAt: new Date("2024-12-23"),
  },
];

const statusColors = {
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
  PAUSED: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  DISABLED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  ERROR: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function ChannelsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Channels</h1>
          <p className="text-muted-foreground">
            Messaging destinations for your webhook notifications
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/channels/new">
            <Plus className="size-4" />
            Create Channel
          </Link>
        </Button>
      </div>

      {/* Channels List */}
      {mockChannels.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <TelegramLogo className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No channels yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              Create your first channel to start receiving notifications in
              Telegram
            </p>
            <Button asChild>
              <Link href="/dashboard/channels/new">
                <Plus className="size-4" />
                Create Channel
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mockChannels.map((channel) => (
            <Card key={channel.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10">
                      <TelegramLogo
                        className="size-5 text-sky-500"
                        weight="fill"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        <Link
                          href={`/dashboard/channels/${channel.id}`}
                          className="hover:underline"
                        >
                          {channel.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Telegram
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={statusColors[channel.status]}
                    >
                      {channel.status.toLowerCase()}
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
                          <Link href={`/dashboard/channels/${channel.id}`}>
                            <Pencil className="size-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {channel.status === "ACTIVE" ? (
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
                {/* Chat Info */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Chat ID:</span>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {channel.config.chatId}
                    </code>
                  </div>
                  {channel.config.threadId && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Thread:</span>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {channel.config.threadId}
                      </code>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    <strong className="text-foreground">
                      {channel.routeCount}
                    </strong>{" "}
                    routes connected
                  </span>
                  <span>
                    <strong className="text-foreground">
                      {channel.deliveryCount}
                    </strong>{" "}
                    messages sent
                  </span>
                  <span className="ml-auto">
                    Created {channel.createdAt.toLocaleDateString()}
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
