"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import {
  ArrowLeftIcon,
  TelegramLogoIcon,
  SlackLogoIcon,
  DiscordLogoIcon,
  EnvelopeIcon,
  GlobeIcon,
  EyeIcon,
  EyeSlashIcon,
  PaperPlaneTiltIcon,
  CheckCircleIcon,
  XCircleIcon,
  SpinnerGapIcon,
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
import { useCreateChannel } from "@/hooks/use-channels";
import { createChannelSchema, channelTypeEnum } from "@/lib/validations/channel";
import { testTelegramChannel } from "@/features/channels/actions/test";

// Channel type configuration
const channelTypes = [
  {
    value: "TELEGRAM" as const,
    label: "Telegram",
    description: "Send messages to a Telegram group or channel",
    icon: TelegramLogoIcon,
    color: "sky",
  },
  {
    value: "SLACK" as const,
    label: "Slack",
    description: "Send messages to a Slack channel",
    icon: SlackLogoIcon,
    color: "purple",
  },
  {
    value: "DISCORD" as const,
    label: "Discord",
    description: "Send messages to a Discord channel",
    icon: DiscordLogoIcon,
    color: "indigo",
  },
  {
    value: "WEBHOOK" as const,
    label: "Webhook",
    description: "Send to any HTTP endpoint",
    icon: GlobeIcon,
    color: "gray",
  },
  {
    value: "EMAIL" as const,
    label: "Email",
    description: "Send email notifications",
    icon: EnvelopeIcon,
    color: "orange",
  },
];

// Form schema for Telegram channel (most common)
const telegramFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: channelTypeEnum,
  botToken: z
    .string()
    .min(1, "Bot token is required")
    .regex(/^\d+:[A-Za-z0-9_-]+$/, "Invalid bot token format"),
  chatId: z
    .string()
    .min(1, "Chat ID is required")
    .regex(/^-?\d+$/, "Chat ID must be a number"),
  threadId: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d+$/.test(val),
      "Thread ID must be a positive number"
    ),
});

type TelegramFormData = z.infer<typeof telegramFormSchema>;

export default function NewChannelPage() {
  const router = useRouter();
  const [showToken, setShowToken] = useState(false);
  const [selectedType, setSelectedType] = useState<typeof channelTypeEnum._type>("TELEGRAM");
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testError, setTestError] = useState<string | null>(null);

  const createChannel = useCreateChannel();

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TelegramFormData>({
    resolver: zodResolver(telegramFormSchema),
    defaultValues: {
      name: "",
      type: "TELEGRAM",
      botToken: "",
      chatId: "",
      threadId: "",
    },
  });

  const handleTypeSelect = (type: typeof channelTypeEnum._type) => {
    setSelectedType(type);
    setValue("type", type);
  };

  const testConnection = async () => {
    const values = getValues();
    if (!values.botToken || !values.chatId) {
      setTestError("Please enter bot token and chat ID first");
      setTestStatus("error");
      return;
    }

    setTestStatus("testing");
    setTestError(null);
    const isConnected = await testTelegramChannel(values.botToken, values.chatId);

    if (isConnected) {
      setTestStatus("success");
    } else {
      setTestStatus("error");
      setTestError("Could not send test message. Check your credentials.");
    }
  };

  const onSubmit = async (data: TelegramFormData) => {
    try {
      // Transform form data to API format
      const channelData = createChannelSchema.parse({
        name: data.name,
        type: data.type,
        credentials: {
          botToken: data.botToken,
        },
        config: {
          chatId: data.chatId,
          ...(data.threadId ? { threadId: data.threadId } : {}),
        },
      });

      await createChannel.mutateAsync(channelData);
      toast.success("Channel created successfully");
      router.push("/dashboard/channels");
    } catch {
      toast.error("Failed to create channel");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/channels">
          <ArrowLeftIcon className="size-4" />
          Back to Channels
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Channel</h1>
        <p className="text-muted-foreground">
          Set up a new messaging destination for your notifications
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Channel Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channel Type</CardTitle>
            <CardDescription>
              Where should notifications be sent?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {channelTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.value;
                const colorClasses = {
                  sky: isSelected ? "border-sky-500/30 bg-sky-500/5" : "",
                  purple: isSelected ? "border-purple-500/30 bg-purple-500/5" : "",
                  indigo: isSelected ? "border-indigo-500/30 bg-indigo-500/5" : "",
                  gray: isSelected ? "border-gray-500/30 bg-gray-500/5" : "",
                  orange: isSelected ? "border-orange-500/30 bg-orange-500/5" : "",
                };
                const iconColorClasses = {
                  sky: "bg-sky-500/10 text-sky-500",
                  purple: "bg-purple-500/10 text-purple-500",
                  indigo: "bg-indigo-500/10 text-indigo-500",
                  gray: "bg-gray-500/10 text-gray-500",
                  orange: "bg-orange-500/10 text-orange-500",
                };

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeSelect(type.value)}
                    disabled={type.value !== "TELEGRAM"} // Only Telegram is supported for now
                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? colorClasses[type.color as keyof typeof colorClasses] + " border-primary"
                        : "border-border"
                    }`}
                  >
                    <div className={`flex size-10 items-center justify-center rounded-lg ${iconColorClasses[type.color as keyof typeof iconColorClasses]}`}>
                      <Icon className="size-5" weight="fill" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {type.value !== "TELEGRAM" ? "Coming soon" : type.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
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
              Configure your Telegram bot credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <Label htmlFor="botToken">Bot Token</Label>
                <div className="relative">
                  <Input
                    id="botToken"
                    type={showToken ? "text" : "password"}
                    placeholder="123456789:ABCdefGHIjklmnoPQRstuVWXyz"
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
                      <EyeSlashIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get this from{" "}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    @BotFather
                  </a>{" "}
                  on Telegram
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
                  The ID of the group, channel, or user to send messages to.
                  Groups usually start with -100
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
                  <SpinnerGapIcon className="size-4 animate-spin" />
                ) : (
                  <PaperPlaneTiltIcon className="size-4" />
                )}
                {testStatus === "testing"
                  ? "Sending..."
                  : "Send Test Message"}
              </Button>

              {testStatus === "success" && (
                <div className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircleIcon className="size-4" weight="fill" />
                  Test message sent successfully!
                </div>
              )}

              {testStatus === "error" && testError && (
                <div className="flex items-center gap-1.5 text-sm text-red-600">
                  <XCircleIcon className="size-4" weight="fill" />
                  {testError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting || createChannel.isPending}>
            {isSubmitting || createChannel.isPending ? "Creating..." : "Create Channel"}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/channels">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
