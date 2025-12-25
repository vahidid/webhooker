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
import { Skeleton } from "@/components/ui/skeleton";
import { useChannels, useUpdateChannel, useDeleteChannel } from "@/hooks/use-channels";

const statusColors = {
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
  PAUSED: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  DISABLED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  ERROR: "bg-red-500/10 text-red-600 border-red-500/20",
};

function ChannelsSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24 ml-auto" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ChannelsPage() {
  const { data, isLoading, error } = useChannels();
  const updateChannel = useUpdateChannel();
  const deleteChannel = useDeleteChannel();

  const toggleChannelStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    
    try {
      await updateChannel.mutateAsync({
        id,
        data: { status: newStatus as any },
      });
      toast.success(`Channel ${newStatus === "ACTIVE" ? "resumed" : "paused"} successfully`);
    } catch (error) {
      toast.error("Failed to update channel status");
    }
  };

  const handleDeleteChannel = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteChannel.mutateAsync(id);
      toast.success("Channel deleted successfully");
    } catch (error) {
      toast.error("Failed to delete channel");
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Channels</h1>
            <p className="text-muted-foreground">
              Messaging destinations for your webhook notifications
            </p>
          </div>
        </div>
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive">Failed to load channels. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const channels = data?.success ? data.data : [];

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

      {/* Loading State */}
      {isLoading && <ChannelsSkeleton />}

      {/* Empty State */}
      {!isLoading && channels.length === 0 && (
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
      )}

      {/* Channels List */}
      {!isLoading && channels.length > 0 && (
        <div className="grid gap-4">
          {channels.map((channel) => {
            const config = channel.config as any;
            return (
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
                          {channel.type}
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
                          <DropdownMenuItem
                            onClick={() => toggleChannelStatus(channel.id, channel.status)}
                            disabled={updateChannel.isPending}
                          >
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
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteChannel(channel.id, channel.name)}
                            disabled={deleteChannel.isPending}
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
                  {/* Chat Info */}
                  <div className="flex items-center gap-4 text-sm">
                    {config?.chatId && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Chat ID:</span>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {config.chatId}
                        </code>
                      </div>
                    )}
                    {config?.threadId && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Thread:</span>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {config.threadId}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      <strong className="text-foreground">
                        {channel._count.routes}
                      </strong>{" "}
                      routes connected
                    </span>
                    <span className="ml-auto">
                      Created {new Date(channel.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
