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
  Eye,
  EyeSlash,
  Copy,
  Check,
  ArrowsClockwise,
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

const endpointSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  description: z.string().max(500).optional(),
  secret: z.string().min(16, "Secret must be at least 16 characters"),
});

type EndpointFormData = z.infer<typeof endpointSchema>;

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
  const orgSlug = "acme-inc"; // Will come from context

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EndpointFormData>({
    resolver: zodResolver(endpointSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      secret: generateSecret(),
    },
  });

  const slug = watch("slug");
  const secret = watch("secret");
  const currentName = watch("name");

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

  const onSubmit = async (data: EndpointFormData) => {
    // TODO: Integrate with API
    console.log("Creating endpoint:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/dashboard/endpoints");
  };

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
            <div className="flex items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-orange-500/10">
                <GitlabLogoSimple
                  className="size-6 text-orange-600"
                  weight="fill"
                />
              </div>
              <div>
                <p className="font-medium">GitLab</p>
                <p className="text-sm text-muted-foreground">
                  Receive push, merge request, and pipeline events
                </p>
              </div>
            </div>
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
              Configure this URL in your GitLab project settings
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
              Used to verify webhook signatures from GitLab. Keep this secure.
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
                Copy this secret and paste it into your GitLab webhook settings.
              </p>
            </Field>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Endpoint"}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/endpoints">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
