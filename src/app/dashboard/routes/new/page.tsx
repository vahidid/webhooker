"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CaretDown,
  Check,
  SpinnerGap,
  Funnel,
  Lightning,
  Clock,
  ArrowsClockwise,
  Info,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useEndpoints } from "@/hooks/use-endpoints";
import { useChannels } from "@/hooks/use-channels";
import { useCreateRoute } from "@/hooks/use-routes";
import { MessageTemplateEditor } from "@/features/routes/message-template-editor";
import { cn } from "@/lib/utils";
import type { EndpointWithRelations } from "@/services/endpoint.service";
import type { ChannelWithRelations } from "@/services/channel.service";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const routeFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  endpointId: z.string().min(1, "Source endpoint is required"),
  channelId: z.string().min(1, "Destination channel is required"),
  filterExpression: z.string().max(1000).optional(),
  messageContent: z.string().max(10000).optional(),
  delaySeconds: z.coerce.number().int().min(0).max(3600),
  retryStrategy: z.enum(["NONE", "LINEAR", "EXPONENTIAL"]),
  retryCount: z.coerce.number().int().min(0).max(10),
  retryIntervalMs: z.coerce.number().int().min(1000).max(3600000),
  priority: z.coerce.number().int().min(0).max(100),
});

type RouteFormData = z.infer<typeof routeFormSchema>;

// -----------------------------------------------------------------------------
// Channel Type Icons & Colors
// -----------------------------------------------------------------------------

const channelTypeConfig: Record<string, { color: string; bgColor: string }> = {
  TELEGRAM: { color: "text-sky-500", bgColor: "bg-sky-500/10" },
  SLACK: { color: "text-purple-500", bgColor: "bg-purple-500/10" },
  DISCORD: { color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  WEBHOOK: { color: "text-gray-500", bgColor: "bg-gray-500/10" },
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function CreateRoutePage() {
  const router = useRouter();

  // UI State
  const [selectedEndpoint, setSelectedEndpoint] =
    useState<EndpointWithRelations | null>(null);
  const [selectedChannel, setSelectedChannel] =
    useState<ChannelWithRelations | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Data fetching
  const { data: endpointsData, isLoading: endpointsLoading } = useEndpoints();
  const { data: channelsData, isLoading: channelsLoading } = useChannels();
  const createRoute = useCreateRoute();

  const endpoints = endpointsData?.success ? endpointsData.data : [];
  const channels = channelsData?.success ? channelsData.data : [];

  // Get available events from selected endpoint
  const availableEvents = useMemo(() => {
    if (!selectedEndpoint) return [];

    // First check endpoint's allowedEvents
    if (selectedEndpoint.allowedEvents?.length > 0) {
      return selectedEndpoint.allowedEvents;
    }

    // Fall back to provider's eventTypes
    const provider = selectedEndpoint.provider;
    if (provider && "eventTypes" in provider) {
      const eventTypes = provider.eventTypes;
      if (Array.isArray(eventTypes)) {
        return eventTypes as string[];
      }
    }

    return [];
  }, [selectedEndpoint]);

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      endpointId: "",
      channelId: "",
      filterExpression: "",
      messageContent: "",
      delaySeconds: 0,
      retryStrategy: "EXPONENTIAL",
      retryCount: 5,
      retryIntervalMs: 60000,
      priority: 0,
    },
  });

  const retryStrategy = watch("retryStrategy");
  const filterExpression = watch("filterExpression");

  // Build filter expression from selected events
  const buildEventFilter = (): string | undefined => {
    if (!selectedEvents.length || !selectedEndpoint) return undefined;

    const providerName = selectedEndpoint.provider?.name;
    const headerName =
      providerName === "github"
        ? "x-github-event"
        : providerName === "gitlab"
          ? "x-gitlab-event"
          : "x-webhook-event";

    const conditions = selectedEvents.map(
      (event) => `$.headers['${headerName}'] == '${event}'`
    );

    return conditions.length === 1
      ? conditions[0]
      : `(${conditions.join(" || ")})`;
  };

  // Form submission
  const onSubmit = async (data: RouteFormData) => {
    try {
      // Use custom filter or auto-generate from selected events
      const finalFilter = data.filterExpression || buildEventFilter();

      await createRoute.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        endpointId: data.endpointId,
        channelId: data.channelId,
        filterExpression: finalFilter,
        messageContent: data.messageContent || null,
        delaySeconds: data.delaySeconds,
        retryStrategy: data.retryStrategy,
        retryCount: data.retryCount,
        retryIntervalMs: data.retryIntervalMs,
        priority: data.priority,
      });

      toast.success("Route created successfully");
      router.push("/dashboard/routes");
    } catch (error) {
      toast.error("Failed to create route");
      console.error("Create route error:", error);
    }
  };

  // Handle endpoint selection
  const handleEndpointSelect = (endpoint: EndpointWithRelations) => {
    setSelectedEndpoint(endpoint);
    setValue("endpointId", endpoint.id);
    setSelectedEvents([]); // Reset events when endpoint changes
  };

  // Handle channel selection
  const handleChannelSelect = (channel: ChannelWithRelations) => {
    setSelectedChannel(channel);
    setValue("channelId", channel.id);
  };

  // Toggle event selection
  const toggleEvent = (event: string, checked: boolean) => {
    setSelectedEvents((prev) =>
      checked ? [...prev, event] : prev.filter((e) => e !== event)
    );
  };

  // Get provider icon
  const getProviderIcon = (provider: EndpointWithRelations["provider"]) => {
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
        {provider?.displayName?.charAt(0)}
      </span>
    );
  };

  // Get channel config
  const getChannelConfig = (type: string) => {
    return (
      channelTypeConfig[type] || {
        color: "text-gray-500",
        bgColor: "bg-gray-500/10",
      }
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/routes">
            <ArrowLeft className="size-4" />
            Back to Routes
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Route</h1>
          <p className="text-muted-foreground">
            Connect a webhook endpoint to a messaging channel
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ------------------------------------------------------------------ */}
        {/* STEP 1: Connection                                                 */}
        {/* ------------------------------------------------------------------ */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Lightning className="size-4 text-primary" weight="fill" />
              </div>
              <div>
                <CardTitle className="text-base">Connection</CardTitle>
                <CardDescription>
                  Select source and destination
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Visual */}
            <div className="flex items-stretch gap-4">
              {/* Endpoint Selector */}
              <div className="flex-1 space-y-2">
                <Label>Source Endpoint</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-between h-auto py-3",
                        errors.endpointId && "border-destructive"
                      )}
                      disabled={endpointsLoading}
                    >
                      {endpointsLoading ? (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <SpinnerGap className="size-4 animate-spin" />
                          Loading...
                        </span>
                      ) : selectedEndpoint ? (
                        <span className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
                            {getProviderIcon(selectedEndpoint.provider)}
                          </span>
                          <span className="text-left">
                            <span className="block font-medium">
                              {selectedEndpoint.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {selectedEndpoint.provider?.displayName}
                            </span>
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Select endpoint...
                        </span>
                      )}
                      <CaretDown className="size-4 shrink-0 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80">
                    {endpoints.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No endpoints available.{" "}
                        <Link
                          href="/dashboard/endpoints/new"
                          className="text-primary hover:underline"
                        >
                          Create one
                        </Link>
                      </div>
                    ) : (
                      endpoints.map((endpoint) => (
                        <DropdownMenuItem
                          key={endpoint.id}
                          onClick={() => handleEndpointSelect(endpoint)}
                          className="flex items-center gap-3 py-3"
                        >
                          <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
                            {getProviderIcon(endpoint.provider)}
                          </span>
                          <span className="flex-1">
                            <span className="block font-medium">
                              {endpoint.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {endpoint.provider?.displayName} ·{" "}
                              {endpoint._count.routes} routes
                            </span>
                          </span>
                          {selectedEndpoint?.id === endpoint.id && (
                            <Check className="size-4 text-primary" />
                          )}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {errors.endpointId && (
                  <p className="text-sm text-destructive">
                    {errors.endpointId.message}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <div className="flex items-center pt-7">
                <div className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Channel Selector */}
              <div className="flex-1 space-y-2">
                <Label>Destination Channel</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-between h-auto py-3",
                        errors.channelId && "border-destructive"
                      )}
                      disabled={channelsLoading}
                    >
                      {channelsLoading ? (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <SpinnerGap className="size-4 animate-spin" />
                          Loading...
                        </span>
                      ) : selectedChannel ? (
                        <span className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex size-8 items-center justify-center rounded-lg",
                              getChannelConfig(selectedChannel.type).bgColor
                            )}
                          >
                            <span
                              className={cn(
                                "text-sm font-bold",
                                getChannelConfig(selectedChannel.type).color
                              )}
                            >
                              {selectedChannel.type.charAt(0)}
                            </span>
                          </span>
                          <span className="text-left">
                            <span className="block font-medium">
                              {selectedChannel.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {selectedChannel.type}
                            </span>
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Select channel...
                        </span>
                      )}
                      <CaretDown className="size-4 shrink-0 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    {channels.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No channels available.{" "}
                        <Link
                          href="/dashboard/channels/new"
                          className="text-primary hover:underline"
                        >
                          Create one
                        </Link>
                      </div>
                    ) : (
                      channels.map((channel) => (
                        <DropdownMenuItem
                          key={channel.id}
                          onClick={() => handleChannelSelect(channel)}
                          className="flex items-center gap-3 py-3"
                        >
                          <span
                            className={cn(
                              "flex size-8 items-center justify-center rounded-lg",
                              getChannelConfig(channel.type).bgColor
                            )}
                          >
                            <span
                              className={cn(
                                "text-sm font-bold",
                                getChannelConfig(channel.type).color
                              )}
                            >
                              {channel.type.charAt(0)}
                            </span>
                          </span>
                          <span className="flex-1">
                            <span className="block font-medium">
                              {channel.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {channel.type}
                            </span>
                          </span>
                          {selectedChannel?.id === channel.id && (
                            <Check className="size-4 text-primary" />
                          )}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {errors.channelId && (
                  <p className="text-sm text-destructive">
                    {errors.channelId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Route Name & Description */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="name">Route Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., MRs to Dev Team"
                  {...register("name")}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>
              <Field>
                <Label htmlFor="description">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="description"
                  placeholder="Brief description..."
                  {...register("description")}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* STEP 2: Event Filtering                                            */}
        {/* ------------------------------------------------------------------ */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
                <Funnel className="size-4 text-amber-600" weight="fill" />
              </div>
              <div>
                <CardTitle className="text-base">Event Filtering</CardTitle>
                <CardDescription>Choose which events to route</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event Selection */}
            {selectedEndpoint && availableEvents.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Event Types</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedEvents.length === 0
                        ? "All events will be routed"
                        : `${selectedEvents.length} of ${availableEvents.length} selected`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEvents(availableEvents)}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEvents([])}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {availableEvents.map((event) => (
                    <label
                      key={event}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                        selectedEvents.includes(event)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <Checkbox
                        checked={selectedEvents.includes(event)}
                        onCheckedChange={(checked) =>
                          toggleEvent(event, checked === true)
                        }
                      />
                      <span className="text-sm font-mono">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : selectedEndpoint ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No specific events configured. All events from{" "}
                  <span className="font-medium">{selectedEndpoint.name}</span>{" "}
                  will be routed.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Select an endpoint to see available events
                </p>
              </div>
            )}

            {/* Custom Filter Expression */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <Funnel className="size-4" />
                  Advanced Filter Expression
                  <CaretDown className="size-3" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-3">
                <Field>
                  <Label htmlFor="filterExpression">
                    JSONPath Filter{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="filterExpression"
                    placeholder="$.headers['x-gitlab-event'] == 'merge_request' && $.payload.action == 'open'"
                    className="font-mono text-sm"
                    rows={3}
                    {...register("filterExpression")}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {filterExpression
                        ? "Custom filter will override event selection"
                        : "Leave empty to use event selection above"}
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                        >
                          View examples
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Filter Expression Examples</DialogTitle>
                          <DialogDescription>
                            Use JSONPath expressions to filter events based on
                            headers or payload
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[60vh] space-y-4 overflow-auto">
                          <FilterExampleSection
                            title="Event Type Filtering"
                            examples={[
                              {
                                code: "$.headers['x-gitlab-event'] == 'merge_request'",
                                desc: "GitLab merge requests only",
                              },
                              {
                                code: "$.headers['x-github-event'] == 'pull_request'",
                                desc: "GitHub pull requests only",
                              },
                            ]}
                          />
                          <FilterExampleSection
                            title="Payload Filtering"
                            examples={[
                              {
                                code: "$.payload.action == 'opened'",
                                desc: "Only newly opened items",
                              },
                              {
                                code: "$.payload.object_attributes.state == 'merged'",
                                desc: "Only merged MRs",
                              },
                            ]}
                          />
                          <FilterExampleSection
                            title="Combined Filters"
                            examples={[
                              {
                                code: "$.headers['x-gitlab-event'] == 'merge_request' && $.payload.action == 'open'",
                                desc: "New MRs only",
                              },
                              {
                                code: "($.payload.action == 'opened' || $.payload.action == 'reopened')",
                                desc: "Opened or reopened",
                              },
                            ]}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Field>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* STEP 3: Message Template                                           */}
        {/* ------------------------------------------------------------------ */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Info className="size-4 text-emerald-600" weight="fill" />
              </div>
              <div>
                <CardTitle className="text-base">Message Template</CardTitle>
                <CardDescription>
                  Format the notification message
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Field>
              <Label htmlFor="messageContent">
                Message Content{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <MessageTemplateEditor
                value={watch("messageContent") || ""}
                onChange={(value) => setValue("messageContent", value)}
                providerName={selectedEndpoint?.provider?.name}
                placeholder={`🔔 **{{payload.object_kind}}** in {{payload.project.name}}

{{payload.object_attributes.title}}
by {{payload.user.name}}

[View Details]({{payload.object_attributes.url}})`}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to forward the raw webhook payload
              </p>
            </Field>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* STEP 4: Delivery Settings                                          */}
        {/* ------------------------------------------------------------------ */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                      <ArrowsClockwise
                        className="size-4 text-blue-600"
                        weight="fill"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Delivery Settings
                      </CardTitle>
                      <CardDescription>
                        Retry strategy and timing
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {retryStrategy} · {watch("retryCount")} retries
                    </Badge>
                    <CaretDown
                      className={cn(
                        "size-4 transition-transform",
                        showAdvanced && "rotate-180"
                      )}
                    />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 border-t pt-6">
                {/* Retry Strategy */}
                <FieldGroup>
                  <Field>
                    <Label htmlFor="retryStrategy">Retry Strategy</Label>
                    <Select
                      value={retryStrategy}
                      onValueChange={(value) =>
                        setValue(
                          "retryStrategy",
                          value as "NONE" | "LINEAR" | "EXPONENTIAL"
                        )
                      }
                    >
                      <SelectTrigger className="w-full sm:w-64">
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
                        "Retries at fixed intervals"}
                      {retryStrategy === "EXPONENTIAL" &&
                        "Retries with increasing delays (1m → 2m → 4m → ...)"}
                    </p>
                  </Field>

                  {retryStrategy !== "NONE" && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                          <Label htmlFor="retryCount">Max Retry Attempts</Label>
                          <Input
                            id="retryCount"
                            type="number"
                            min={1}
                            max={10}
                            className="w-full"
                            {...register("retryCount")}
                          />
                          {errors.retryCount && (
                            <FieldError>{errors.retryCount.message}</FieldError>
                          )}
                        </Field>

                        <Field>
                          <Label htmlFor="retryIntervalMs">
                            {retryStrategy === "LINEAR"
                              ? "Retry Interval"
                              : "Base Interval"}
                            <span className="text-muted-foreground">
                              {" "}
                              (ms)
                            </span>
                          </Label>
                          <Input
                            id="retryIntervalMs"
                            type="number"
                            min={1000}
                            max={3600000}
                            step={1000}
                            className="w-full"
                            {...register("retryIntervalMs")}
                          />
                          {errors.retryIntervalMs && (
                            <FieldError>
                              {errors.retryIntervalMs.message}
                            </FieldError>
                          )}
                        </Field>
                      </div>
                    </>
                  )}
                </FieldGroup>

                {/* Timing & Priority */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <Label htmlFor="delaySeconds">
                      <Clock className="inline size-3 mr-1" />
                      Initial Delay{" "}
                      <span className="text-muted-foreground">(seconds)</span>
                    </Label>
                    <Input
                      id="delaySeconds"
                      type="number"
                      min={0}
                      max={3600}
                      className="w-full"
                      {...register("delaySeconds")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Wait before first delivery attempt
                    </p>
                    {errors.delaySeconds && (
                      <FieldError>{errors.delaySeconds.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <Label htmlFor="priority">
                      Priority{" "}
                      <span className="text-muted-foreground">(0-100)</span>
                    </Label>
                    <Input
                      id="priority"
                      type="number"
                      min={0}
                      max={100}
                      className="w-full"
                      {...register("priority")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower = higher priority
                    </p>
                    {errors.priority && (
                      <FieldError>{errors.priority.message}</FieldError>
                    )}
                  </Field>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* ------------------------------------------------------------------ */}
        {/* Actions                                                            */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={createRoute.isPending}
            className="min-w-32"
          >
            {createRoute.isPending ? (
              <>
                <SpinnerGap className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Route"
            )}
          </Button>
          <Button type="button" variant="ghost" size="lg" asChild>
            <Link href="/dashboard/routes">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------------------

interface FilterExampleSectionProps {
  title: string;
  examples: Array<{ code: string; desc: string }>;
}

function FilterExampleSection({ title, examples }: FilterExampleSectionProps) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-medium">{title}</h4>
      <div className="space-y-2">
        {examples.map(({ code, desc }) => (
          <div key={code} className="rounded-lg bg-muted p-3">
            <code className="block text-xs break-all">{code}</code>
            <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
