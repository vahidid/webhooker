"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { toast } from "sonner";
import {
  ArrowLeft,
  GitlabLogoSimple,
  TelegramLogo,
  ArrowRight,
  CaretDown,
  Check,
  SpinnerGap,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEndpoints } from "@/hooks/use-endpoints";
import { useChannels } from "@/hooks/use-channels";
import { useCreateRoute } from "@/hooks/use-routes";
import { MessageTemplateEditor } from "@/features/routes/message-template-editor";
import type { EndpointWithRelations } from "@/services/endpoint.service";
import type { ChannelWithRelations } from "@/services/channel.service";

const routeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  endpointId: z.string().min(1, "Endpoint is required"),
  channelId: z.string().min(1, "Channel is required"),
  eventTypes: z.array(z.string()).optional(),
  messageTemplate: z.string().optional(),
  retryStrategy: z.enum(["NONE", "LINEAR", "EXPONENTIAL"]),
  retryCount: z.coerce.number().min(0).max(10),
});

type RouteFormData = z.infer<typeof routeSchema>;

// Get channel icon based on type
const getChannelIcon = (type: string) => {
  switch (type) {
    case "TELEGRAM":
      return <TelegramLogo className="size-4 text-sky-500" weight="fill" />;
    default:
      return <TelegramLogo className="size-4 text-sky-500" weight="fill" />;
  }
};

const getChannelIconSmall = (type: string) => {
  switch (type) {
    case "TELEGRAM":
      return <TelegramLogo className="size-3 text-sky-500" weight="fill" />;
    default:
      return <TelegramLogo className="size-3 text-sky-500" weight="fill" />;
  }
};

export default function NewRoutePage() {
  const router = useRouter();
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointWithRelations | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChannelWithRelations | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  // Fetch endpoints and channels from API
  const { data: endpointsData, isLoading: endpointsLoading } = useEndpoints();
  const { data: channelsData, isLoading: channelsLoading } = useChannels();
  const createRoute = useCreateRoute();

  const endpoints = endpointsData?.success ? endpointsData.data : [];
  const channels = channelsData?.success ? channelsData.data : [];

  // Get available events from selected endpoint's provider
  const availableEvents = useMemo(() => {
    if (!selectedEndpoint) return [];
    
    // First check if endpoint has allowedEvents configured
    if (selectedEndpoint.allowedEvents && selectedEndpoint.allowedEvents.length > 0) {
      return selectedEndpoint.allowedEvents;
    }
    
    // Otherwise, try to get events from provider's eventTypes
    const provider = selectedEndpoint.provider;
    if (provider && 'eventTypes' in provider) {
      const eventTypes = provider.eventTypes;
      if (Array.isArray(eventTypes)) {
        return eventTypes as string[];
      }
    }
    
    return [];
  }, [selectedEndpoint]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: "",
      endpointId: "",
      channelId: "",
      eventTypes: [],
      messageTemplate: "",
      retryStrategy: "EXPONENTIAL",
      retryCount: 5,
    },
  });

  const retryStrategy = watch("retryStrategy");

  // Handle event selection
  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) => {
      const newEvents = prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event];
      setValue("eventTypes", newEvents);
      return newEvents;
    });
  };

  const onSubmit = async (data: RouteFormData) => {
    try {
      // Build filter expression from selected events if any
      let filterExpression: string | undefined;
      if (data.eventTypes && data.eventTypes.length > 0) {
        // Create a filter expression based on selected events
        // This assumes events come from x-gitlab-event header or similar
        const eventConditions = data.eventTypes.map(
          (event) => `$.headers['x-gitlab-event'] == '${event}'`
        );
        filterExpression = eventConditions.length === 1
          ? eventConditions[0]
          : `(${eventConditions.join(' || ')})`;
      }

      await createRoute.mutateAsync({
        name: data.name,
        endpointId: data.endpointId,
        channelId: data.channelId,
        filterExpression,
        messageContent: data.messageTemplate || null,
        retryStrategy: data.retryStrategy,
        retryCount: data.retryCount,
        delaySeconds: 0,
        retryIntervalMs: 60000,
        priority: 0,
      });
      
      toast.success("Route created successfully");
      router.push("/dashboard/routes");
    } catch (error) {
      toast.error("Failed to create route");
      console.error("Error creating route:", error);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/routes">
          <ArrowLeft className="size-4" />
          Back to Routes
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Route</h1>
        <p className="text-muted-foreground">
          Connect an endpoint to a channel with optional filtering
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Route Name */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Route Details</CardTitle>
            <CardDescription>
              Give your route a descriptive name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Merge Requests to Dev Team"
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
          </CardContent>
        </Card>

        {/* Route Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connection</CardTitle>
            <CardDescription>
              Select the source endpoint and destination channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {/* Endpoint Selector */}
              <div className="flex-1">
                <Label className="mb-2 block">Source Endpoint</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-auto py-3"
                      disabled={endpointsLoading}
                    >
                      {endpointsLoading ? (
                        <div className="flex items-center gap-2">
                          <SpinnerGap className="size-4 animate-spin" />
                          <span className="text-muted-foreground">Loading...</span>
                        </div>
                      ) : selectedEndpoint ? (
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-md bg-orange-500/10">
                            <GitlabLogoSimple
                              className="size-4 text-orange-600"
                              weight="fill"
                            />
                          </div>
                          <span className="font-medium">
                            {selectedEndpoint.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Select endpoint...
                        </span>
                      )}
                      <CaretDown className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
                    {endpoints.length === 0 ? (
                      <DropdownMenuItem disabled>
                        No endpoints available
                      </DropdownMenuItem>
                    ) : (
                      endpoints.map((endpoint) => (
                        <DropdownMenuItem
                          key={endpoint.id}
                          onClick={() => {
                            setSelectedEndpoint(endpoint);
                            setValue("endpointId", endpoint.id);
                            // Reset selected events when endpoint changes
                            setSelectedEvents([]);
                            setValue("eventTypes", []);
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex size-6 items-center justify-center rounded bg-orange-500/10">
                              <GitlabLogoSimple
                                className="size-3 text-orange-600"
                                weight="fill"
                              />
                            </div>
                            {endpoint.name}
                          </div>
                          {selectedEndpoint?.id === endpoint.id && (
                            <Check className="size-4" />
                          )}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {errors.endpointId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endpointId.message}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <div className="flex items-center pt-6">
                <ArrowRight className="size-5 text-muted-foreground" />
              </div>

              {/* Channel Selector */}
              <div className="flex-1">
                <Label className="mb-2 block">Destination Channel</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-auto py-3"
                      disabled={channelsLoading}
                    >
                      {channelsLoading ? (
                        <div className="flex items-center gap-2">
                          <SpinnerGap className="size-4 animate-spin" />
                          <span className="text-muted-foreground">Loading...</span>
                        </div>
                      ) : selectedChannel ? (
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-md bg-sky-500/10">
                            {getChannelIcon(selectedChannel.type)}
                          </div>
                          <span className="font-medium">
                            {selectedChannel.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Select channel...
                        </span>
                      )}
                      <CaretDown className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-(--radix-dropdown-menu-trigger-width)">
                    {channels.length === 0 ? (
                      <DropdownMenuItem disabled>
                        No channels available
                      </DropdownMenuItem>
                    ) : (
                      channels.map((channel) => (
                        <DropdownMenuItem
                          key={channel.id}
                          onClick={() => {
                            setSelectedChannel(channel);
                            setValue("channelId", channel.id);
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex size-6 items-center justify-center rounded bg-sky-500/10">
                              {getChannelIconSmall(channel.type)}
                            </div>
                            {channel.name}
                          </div>
                          {selectedChannel?.id === channel.id && (
                            <Check className="size-4" />
                          )}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {errors.channelId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.channelId.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Types</CardTitle>
            <CardDescription>
              Select which events should trigger this route (leave empty for all events)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedEndpoint ? (
              <p className="text-sm text-muted-foreground">
                Select an endpoint first to see available event types
              </p>
            ) : availableEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No specific events configured for this endpoint. All events will be routed.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {availableEvents.map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedEvents.includes(event)}
                        onCheckedChange={() => toggleEvent(event)}
                      />
                      <span className="text-sm font-mono">{event}</span>
                    </label>
                  ))}
                </div>
                {selectedEvents.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Template */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Message Template</CardTitle>
            <CardDescription>
              Define how the webhook payload should be formatted when sent to the channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <Label htmlFor="messageTemplate">
                Message{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <MessageTemplateEditor
                value={watch("messageTemplate") || ""}
                onChange={(value) => setValue("messageTemplate", value)}
                eventTypes={selectedEvents}
                placeholder={`Example:
🔔 **{{payload.object_kind}}** in {{payload.project.name}}

{{payload.object_attributes.title}}
by {{payload.user.name}}

[View Details]({{payload.object_attributes.url}})`}
              />
            </Field>
          </CardContent>
        </Card>

        {/* Retry Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Retry Configuration</CardTitle>
            <CardDescription>
              How to handle failed delivery attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <Label htmlFor="retryStrategy">Retry Strategy</Label>
                <Select
                  defaultValue="EXPONENTIAL"
                  onValueChange={(value) =>
                    setValue(
                      "retryStrategy",
                      value as "NONE" | "LINEAR" | "EXPONENTIAL"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">No retries</SelectItem>
                    <SelectItem value="LINEAR">
                      Linear (fixed interval)
                    </SelectItem>
                    <SelectItem value="EXPONENTIAL">
                      Exponential backoff
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {retryStrategy === "NONE" &&
                    "Failed deliveries will not be retried"}
                  {retryStrategy === "LINEAR" &&
                    "Retries at fixed intervals (e.g., every 60 seconds)"}
                  {retryStrategy === "EXPONENTIAL" &&
                    "Retries with increasing delays (1min → 2min → 4min → ...)"}
                </p>
              </Field>

              {retryStrategy !== "NONE" && (
                <Field>
                  <Label htmlFor="retryCount">Max Retry Attempts</Label>
                  <Input
                    id="retryCount"
                    type="number"
                    min={1}
                    max={10}
                    className="w-24"
                    {...register("retryCount")}
                  />
                  {errors.retryCount && (
                    <FieldError>{errors.retryCount.message}</FieldError>
                  )}
                </Field>
              )}
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting || createRoute.isPending}>
            {(isSubmitting || createRoute.isPending) ? (
              <>
                <SpinnerGap className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Route"
            )}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/routes">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
