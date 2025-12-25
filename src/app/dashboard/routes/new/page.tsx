"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import {
  ArrowLeft,
  GitlabLogoSimple,
  TelegramLogo,
  ArrowRight,
  CaretDown,
  Check,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

// Mock data - will be replaced with real data from API
const mockEndpoints = [
  { id: "1", name: "Production GitLab", slug: "production-gitlab" },
  { id: "2", name: "Staging GitLab", slug: "staging-gitlab" },
];

const mockChannels = [
  { id: "1", name: "Dev Team Notifications", type: "TELEGRAM" },
  { id: "2", name: "Alerts Channel", type: "TELEGRAM" },
  { id: "3", name: "Staging Notifications", type: "TELEGRAM" },
];

const mockTemplates = [
  { id: "1", name: "MR Notification" },
  { id: "2", name: "Pipeline Alert" },
  { id: "3", name: "Push Event" },
];

const routeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  endpointId: z.string().min(1, "Endpoint is required"),
  channelId: z.string().min(1, "Channel is required"),
  filterExpression: z.string().optional(),
  templateId: z.string().optional(),
  retryStrategy: z.enum(["NONE", "LINEAR", "EXPONENTIAL"]),
  retryCount: z.coerce.number().min(0).max(10),
});

type RouteFormData = z.infer<typeof routeSchema>;

export default function NewRoutePage() {
  const router = useRouter();
  const [selectedEndpoint, setSelectedEndpoint] = useState<
    (typeof mockEndpoints)[0] | null
  >(null);
  const [selectedChannel, setSelectedChannel] = useState<
    (typeof mockChannels)[0] | null
  >(null);

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
      filterExpression: "",
      templateId: "",
      retryStrategy: "EXPONENTIAL",
      retryCount: 5,
    },
  });

  const retryStrategy = watch("retryStrategy");

  const onSubmit = async (data: RouteFormData) => {
    // TODO: Integrate with API
    console.log("Creating route:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/dashboard/routes");
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
                    >
                      {selectedEndpoint ? (
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
                    {mockEndpoints.map((endpoint) => (
                      <DropdownMenuItem
                        key={endpoint.id}
                        onClick={() => {
                          setSelectedEndpoint(endpoint);
                          setValue("endpointId", endpoint.id);
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
                    ))}
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
                    >
                      {selectedChannel ? (
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-md bg-sky-500/10">
                            <TelegramLogo
                              className="size-4 text-sky-500"
                              weight="fill"
                            />
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
                    {mockChannels.map((channel) => (
                      <DropdownMenuItem
                        key={channel.id}
                        onClick={() => {
                          setSelectedChannel(channel);
                          setValue("channelId", channel.id);
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex size-6 items-center justify-center rounded bg-sky-500/10">
                            <TelegramLogo
                              className="size-3 text-sky-500"
                              weight="fill"
                            />
                          </div>
                          {channel.name}
                        </div>
                        {selectedChannel?.id === channel.id && (
                          <Check className="size-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
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

        {/* Filter Expression */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filter Expression</CardTitle>
            <CardDescription>
              Only route events matching this JSONPath expression (leave empty
              for all events)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <Label htmlFor="filterExpression">
                JSONPath Filter{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="filterExpression"
                placeholder="$.headers['x-gitlab-event'] == 'Merge Request Hook'"
                rows={2}
                className="font-mono text-sm"
                {...register("filterExpression")}
              />
              <p className="text-xs text-muted-foreground">
                Examples: <code>$.headers[&apos;x-gitlab-event&apos;] == &apos;Push Hook&apos;</code>,{" "}
                <code>$.body.object_attributes.status == &apos;failed&apos;</code>
              </p>
            </Field>
          </CardContent>
        </Card>

        {/* Message Template */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Message Template</CardTitle>
            <CardDescription>
              Transform the webhook payload into a custom message format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <Label htmlFor="templateId">
                Template{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("templateId", value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pass through raw payload" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Pass through raw payload</SelectItem>
                  {mockTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Without a template, the raw webhook payload will be sent to the
                channel
              </p>
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Route"}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/routes">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
