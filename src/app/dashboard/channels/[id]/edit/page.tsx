"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import {
  ArrowLeft,
  TelegramLogo,
  Eye,
  EyeSlash,
  PaperPlaneTilt,
  CheckCircle,
  XCircle,
  SpinnerGap,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useChannel, useUpdateChannel } from "@/hooks/use-channels";
import { testTelegramChannel } from "@/features/channels/actions/test";

// Form schema for editing Telegram channel
const editChannelSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  status: z.enum(["ACTIVE", "PAUSED", "DISABLED", "ERROR"]),
  botToken: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d+:[A-Za-z0-9_-]+$/.test(val),
      "Invalid bot token format"
    ),
  chatId: z.string().regex(/^-?\d+$/, "Chat ID must be a number"),
  threadId: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d+$/.test(val),
      "Thread ID must be a positive number"
    ),
});

type EditChannelFormData = z.infer<typeof editChannelSchema>;

const statusOptions = [
  { value: "ACTIVE", label: "Active", color: "bg-green-500" },
  { value: "PAUSED", label: "Paused", color: "bg-yellow-500" },
  { value: "DISABLED", label: "Disabled", color: "bg-gray-500" },
];

export default function EditChannelPage() {
  const router = useRouter();
  const params = useParams();
  const channelId = params.id as string;

  const [showToken, setShowToken] = useState(false);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testError, setTestError] = useState<string | null>(null);

  const { data: channelData, isLoading, error } = useChannel(channelId);
  const updateChannel = useUpdateChannel();

  const channel = channelData?.success ? channelData.data : undefined;

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditChannelFormData>({
    resolver: zodResolver(editChannelSchema),
    defaultValues: {
      name: "",
      status: "ACTIVE",
      botToken: "",
      chatId: "",
      threadId: "",
    },
  });

  // Populate form when channel data is loaded
  useEffect(() => {
    if (channel) {
      const config = channel.config as Record<string, string> | null;
      reset({
        name: channel.name,
        status: channel.status,
        botToken: "", // Don't populate for security
        chatId: config?.chatId ?? "",
        threadId: config?.threadId ?? "",
      });
    }
  }, [channel, reset]);

  const status = watch("status");

  const testConnection = async () => {
    const values = getValues();
    if (!values.chatId) {
      setTestError("Please enter chat ID first");
      setTestStatus("error");
      return;
    }

    setTestStatus("testing");
    setTestError(null);

    const isConnected = await testTelegramChannel(values.botToken!, values.chatId);

    if (isConnected) {
      setTestStatus("success");
    } else {
      setTestStatus("error");
      setTestError("Could not send test message. Check your credentials.");
    }
  };

  const onSubmit = async (data: EditChannelFormData) => {
    try {
      const updateData: Record<string, unknown> = {
        name: data.name,
        status: data.status,
        config: {
          chatId: data.chatId,
          ...(data.threadId ? { threadId: data.threadId } : {}),
        },
      };

      // Only update credentials if a new token was provided
      if (data.botToken) {
        updateData.credentials = {
          botToken: data.botToken,
        };
      }

      await updateChannel.mutateAsync({
        id: channelId,
        data: updateData,
      });
      toast.success("Channel updated successfully");
      router.push("/dashboard/channels");
    } catch {
      toast.error("Failed to update channel");
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

  if (error || !channel) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/channels">
            <ArrowLeft className="size-4" />
            Back to Channels
          </Link>
        </Button>
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive">
              Failed to load channel. It may have been deleted.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/channels">Return to Channels</Link>
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
        <Link href="/dashboard/channels">
          <ArrowLeft className="size-4" />
          Back to Channels
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Channel</h1>
          <p className="text-muted-foreground">
            Modify your messaging channel settings
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            status === "ACTIVE"
              ? "bg-green-500/10 text-green-600 border-green-500/20"
              : status === "PAUSED"
              ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
              : status === "ERROR"
              ? "bg-red-500/10 text-red-600 border-red-500/20"
              : "bg-gray-500/10 text-gray-600 border-gray-500/20"
          }
        >
          {status}
        </Badge>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Channel Type (read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channel Type</CardTitle>
            <CardDescription>
              The messaging platform for this channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/30">
              <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10">
                <TelegramLogo className="size-5 text-sky-500" weight="fill" />
              </div>
              <div>
                <p className="font-medium">{channel.type}</p>
                <p className="text-xs text-muted-foreground">
                  Channel type cannot be changed after creation
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
              Control whether this channel receives notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <Select
                value={status}
                onValueChange={(value) =>
                  setValue("status", value as "ACTIVE" | "PAUSED" | "DISABLED" | "ERROR", {
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
                        <span className={`size-2 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {status === "ACTIVE" && "Channel is receiving notifications normally."}
                {status === "PAUSED" && "Notifications will be queued but not sent."}
                {status === "DISABLED" && "Notifications will be dropped."}
                {status === "ERROR" && "Channel has an error and needs attention."}
              </p>
            </Field>
          </CardContent>
        </Card>

        {/* Channel Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channel Details</CardTitle>
            <CardDescription>
              Give your channel a recognizable name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Dev Team Notifications"
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
          </CardContent>
        </Card>

        {/* Telegram Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Telegram Bot Settings</CardTitle>
            <CardDescription>
              Update your Telegram bot credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <Label htmlFor="botToken">
                  Bot Token{" "}
                  <span className="text-muted-foreground">(leave blank to keep current)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="botToken"
                    type={showToken ? "text" : "password"}
                    placeholder="Enter new token to update"
                    className="pr-10 font-mono text-sm"
                    {...register("botToken")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? (
                      <EyeSlash className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  For security, the current token is not displayed
                </p>
                {errors.botToken && (
                  <FieldError>{errors.botToken.message}</FieldError>
                )}
              </Field>

              <Field>
                <Label htmlFor="chatId">Chat ID</Label>
                <Input
                  id="chatId"
                  placeholder="-100123456789"
                  className="font-mono text-sm"
                  {...register("chatId")}
                />
                <p className="text-xs text-muted-foreground">
                  The ID of the group, channel, or user to send messages to
                </p>
                {errors.chatId && (
                  <FieldError>{errors.chatId.message}</FieldError>
                )}
              </Field>

              <Field>
                <Label htmlFor="threadId">
                  Thread ID{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="threadId"
                  placeholder="5"
                  className="font-mono text-sm"
                  {...register("threadId")}
                />
                <p className="text-xs text-muted-foreground">
                  For groups with topics enabled, specify the topic thread ID
                </p>
                {errors.threadId && (
                  <FieldError>{errors.threadId.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Test Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test Connection</CardTitle>
            <CardDescription>
              Send a test message to verify your configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={testStatus === "testing"}
              >
                {testStatus === "testing" ? (
                  <SpinnerGap className="size-4 animate-spin" />
                ) : (
                  <PaperPlaneTilt className="size-4" />
                )}
                {testStatus === "testing"
                  ? "Sending..."
                  : "Send Test Message"}
              </Button>

              {testStatus === "success" && (
                <div className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle className="size-4" weight="fill" />
                  Test message sent successfully!
                </div>
              )}

              {testStatus === "error" && testError && (
                <div className="flex items-center gap-1.5 text-sm text-red-600">
                  <XCircle className="size-4" weight="fill" />
                  {testError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || updateChannel.isPending || !isDirty}
          >
            {isSubmitting || updateChannel.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/channels">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
