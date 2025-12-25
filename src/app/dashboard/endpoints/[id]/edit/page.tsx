"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Eye,
  EyeSlash,
  Copy,
  Check,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { toast } from "sonner";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEndpoint, useUpdateEndpoint } from "@/hooks/use-endpoints";
import {
  updateEndpointSchema,
  UpdateEndpointInput,
} from "@/lib/validations/endpoint";

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

const statusOptions = [
  { value: "ACTIVE", label: "Active", color: "bg-green-500/10 text-green-600" },
  { value: "PAUSED", label: "Paused", color: "bg-yellow-500/10 text-yellow-600" },
  { value: "DISABLED", label: "Disabled", color: "bg-gray-500/10 text-gray-600" },
];

export default function EditEndpointPage() {
  const router = useRouter();
  const params = useParams();
  const endpointId = params.id as string;
  
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const orgSlug = "acme-inc"; // Will come from context

  const { data: endpointData, isLoading, error } = useEndpoint(endpointId);
  const updateEndpoint = useUpdateEndpoint();

  const endpoint = endpointData?.success ? endpointData.data : undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateEndpointInput>({
    resolver: zodResolver(updateEndpointSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      secret: "",
      status: "ACTIVE",
    },
  });

  // Populate form when endpoint data is loaded
  useEffect(() => {
    if (endpoint) {
      reset({
        name: endpoint.name,
        slug: endpoint.slug,
        description: endpoint.description ?? "",
        secret: endpoint.secret ?? undefined,
        status: endpoint.status,
      });
    }
  }, [endpoint, reset]);

  const slug = watch("slug");
  const secret = watch("secret");
  const currentName = watch("name");
  const status = watch("status");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const currentSlug = slug ?? "";
    const previousName = currentName ?? "";
    // Only auto-update slug if it was empty or matches the slugified version of the previous name
    if (!currentSlug || currentSlug === slugify(previousName)) {
      setValue("slug", slugify(newName));
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const regenerateSecret = () => {
    setValue("secret", generateSecret(), { shouldDirty: true });
  };

  const onSubmit = async (data: UpdateEndpointInput) => {
    try {
      await updateEndpoint.mutateAsync({
        id: endpointId,
        data,
      });
      toast.success("Endpoint updated successfully");
      router.push("/dashboard/endpoints");
    } catch {
      toast.error("Failed to update endpoint");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-40" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-5 w-72" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !endpoint) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/endpoints">
            <ArrowLeft className="size-4" />
            Back to Endpoints
          </Link>
        </Button>
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive">
              Failed to load endpoint. It may have been deleted.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/endpoints">Return to Endpoints</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/endpoints">
          <ArrowLeft className="size-4" />
          Back to Endpoints
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Endpoint</h1>
          <p className="text-muted-foreground">
            Modify your webhook endpoint settings
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            status === "ACTIVE"
              ? "bg-green-500/10 text-green-600 border-green-500/20"
              : status === "PAUSED"
              ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
              : "bg-gray-500/10 text-gray-600 border-gray-500/20"
          }
        >
          {status}
        </Badge>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Provider Info (read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Provider</CardTitle>
            <CardDescription>
              The source application sending webhooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/30">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                {endpoint.provider?.iconUrl ? (
                  <Image
                    src={endpoint.provider.iconUrl}
                    alt={endpoint.provider.displayName}
                    width={24}
                    height={24}
                    className="size-6"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {endpoint.provider?.displayName?.charAt(0) ?? "?"}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium">{endpoint.provider?.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  Provider cannot be changed after creation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
            <CardDescription>
              Control whether this endpoint receives webhooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <Select
                value={status}
                onValueChange={(value) =>
                  setValue("status", value as "ACTIVE" | "PAUSED" | "DISABLED", {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${
                            option.value === "ACTIVE"
                              ? "bg-green-500"
                              : option.value === "PAUSED"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                          }`}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {status === "ACTIVE" && "Endpoint is receiving webhooks normally."}
                {status === "PAUSED" && "Webhooks will be queued but not processed."}
                {status === "DISABLED" && "Webhooks will be rejected."}
              </p>
            </Field>
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

        {/* Webhook URL Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Webhook URL</CardTitle>
            <CardDescription>
              Configure this URL in your {endpoint.provider?.displayName ?? "provider"} settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <code className="text-sm break-all">
                https://webhooker.app/api/webhook/{orgSlug}/
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
              Used to verify webhook signatures from {endpoint.provider?.displayName ?? "your provider"}. Keep this secure.
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
                        <EyeSlash className="size-4" />
                      ) : (
                        <Eye className="size-4" />
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
                        <Check className="size-4 text-green-600" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={regenerateSecret}
                >
                  <ArrowsClockwise className="size-4" />
                  Regenerate
                </Button>
              </div>
              {errors.secret && <FieldError>{errors.secret.message}</FieldError>}
              <p className="text-xs text-muted-foreground">
                Copy this secret and paste it into your {endpoint.provider?.displayName ?? "provider"} webhook settings.
              </p>
            </Field>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || updateEndpoint.isPending || !isDirty}
          >
            {isSubmitting || updateEndpoint.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/endpoints">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
