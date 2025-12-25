"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  CopyIcon,
  CheckIcon,
  ArrowsClockwiseIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProviders } from "@/hooks/use-providers";
import { useCreateEndpoint } from "@/hooks/use-endpoints";
import { createEndpointSchema } from "@/lib/validations/endpoint";
import { useCurrentOrganization } from "@/components/providers/organization";
import { z } from "zod/v3";
import { APP_URL } from "@/utils/constants";

// Form input type (before transforms)
type EndpointFormData = z.input<typeof createEndpointSchema>;

function generateSecret(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

export default function NewEndpointPage() {
  const router = useRouter();
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const { currentOrganization } = useCurrentOrganization();
  const orgSlug = currentOrganization?.slug ?? "";

  const { data: providersData, isLoading: isLoadingProviders } = useProviders();
  const createEndpoint = useCreateEndpoint();

  const providers = providersData?.success ? providersData.data : [];
  const selectedProvider = providers.find((p) => p.id === selectedProviderId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EndpointFormData>({
    resolver: zodResolver(createEndpointSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      secret: generateSecret(),
      providerId: "",
      allowedEvents: [],
    },
  });

  const slug = watch("slug");
  const secret = watch("secret");
  const currentName = watch("name");
  const allowedEvents = watch("allowedEvents") ?? [];

  // Get event types from selected provider
  const providerEventTypes: string[] = selectedProvider?.eventTypes
    ? (selectedProvider.eventTypes as string[])
    : [];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    // Only auto-update slug if it was empty or matches the slugified version of the previous name
    if (!slug || slug === slugify(currentName)) {
      setValue("slug", slugify(newName));
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateSecret = () => {
    setValue("secret", generateSecret());
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviderId(providerId);
    setValue("providerId", providerId);
    // Reset allowed events when provider changes
    setValue("allowedEvents", []);
  };

  const handleEventToggle = (eventType: string, checked: boolean) => {
    if (checked) {
      setValue("allowedEvents", [...allowedEvents, eventType]);
    } else {
      setValue("allowedEvents", allowedEvents.filter((e) => e !== eventType));
    }
  };

  const handleSelectAllEvents = () => {
    if (allowedEvents.length === providerEventTypes.length) {
      // Deselect all
      setValue("allowedEvents", []);
    } else {
      // Select all
      setValue("allowedEvents", [...providerEventTypes]);
    }
  };

  const onSubmit = async (data: EndpointFormData) => {
    try {
      const validatedData = createEndpointSchema.parse(data);
      await createEndpoint.mutateAsync(validatedData);
      toast.success("Endpoint created successfully");
      router.push("/dashboard/endpoints");
    } catch {
      toast.error("Failed to create endpoint");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/endpoints">
          <ArrowLeftIcon className="size-4" />
          Back to Endpoints
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Endpoint</h1>
        <p className="text-muted-foreground">
          Set up a new webhook endpoint to receive events
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Provider Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Provider</CardTitle>
            <CardDescription>
              The source application sending webhooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProviders ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : providers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No providers available.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleProviderSelect(provider.id)}
                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 ${
                      selectedProviderId === provider.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      {provider.iconUrl ? (
                        <Image
                          src={provider.iconUrl}
                          alt={provider.displayName}
                          width={24}
                          height={24}
                          className="size-6"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {provider.displayName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{provider.displayName}</p>
                      {provider.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {provider.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {errors.providerId && (
              <FieldError className="mt-2">{errors.providerId.message}</FieldError>
            )}
          </CardContent>
        </Card>

        {/* Endpoint Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Endpoint Details</CardTitle>
            <CardDescription>Basic information about your endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Production GitLab"
                  {...register("name", {
                    onChange: handleNameChange,
                  })}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="e.g., production-gitlab"
                  {...register("slug")}
                />
                <p className="text-xs text-muted-foreground">
                  Used in the webhook URL. Only lowercase letters, numbers, and
                  hyphens.
                </p>
                {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
              </Field>

              <Field>
                <Label htmlFor="description">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of this endpoint..."
                  rows={2}
                  {...register("description")}
                />
                {errors.description && (
                  <FieldError>{errors.description.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Allowed Events */}
        {selectedProvider && providerEventTypes.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Allowed Events</CardTitle>
                  <CardDescription>
                    Select which events this endpoint should receive. Leave empty to receive all events.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllEvents}
                >
                  {allowedEvents.length === providerEventTypes.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {providerEventTypes.map((eventType) => (
                  <label
                    key={eventType}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={allowedEvents.includes(eventType)}
                      onCheckedChange={(checked) =>
                        handleEventToggle(eventType, checked === true)
                      }
                    />
                    <span className="text-sm font-mono">{eventType}</span>
                  </label>
                ))}
              </div>
              {allowedEvents.length === 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  No events selected — endpoint will receive all event types from {selectedProvider.displayName}.
                </p>
              )}
              {allowedEvents.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  {allowedEvents.length} of {providerEventTypes.length} events selected.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Webhook URL Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Webhook URL</CardTitle>
            <CardDescription>
              Configure this URL in your {selectedProvider?.displayName ?? "provider"} settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <code className="text-sm break-all">
                {APP_URL}/api/webhook/{orgSlug}/
                <span className="text-primary">{slug || "your-slug"}</span>
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Secret */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Webhook Secret</CardTitle>
            <CardDescription>
              Used to verify webhook signatures from {selectedProvider?.displayName ?? "your provider"}. Keep this secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="secret"
                    type={showSecret ? "text" : "password"}
                    className="pr-20 font-mono text-sm"
                    {...register("secret")}
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? (
                        <EyeSlashIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={copySecret}
                    >
                      {copied ? (
                        <CheckIcon className="size-4 text-green-600" />
                      ) : (
                        <CopyIcon className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={regenerateSecret}
                >
                  <ArrowsClockwiseIcon className="size-4" />
                  Regenerate
                </Button>
              </div>
              {errors.secret && <FieldError>{errors.secret.message}</FieldError>}
              <p className="text-xs text-muted-foreground">
                Copy this secret and paste it into your {selectedProvider?.displayName ?? "provider"} webhook settings.
              </p>
            </Field>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting || createEndpoint.isPending}>
            {isSubmitting || createEndpoint.isPending ? "Creating..." : "Create Endpoint"}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/endpoints">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
