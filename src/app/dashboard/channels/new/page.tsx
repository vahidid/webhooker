"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const channelSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
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

type ChannelFormData = z.infer<typeof channelSchema>;

export default function NewChannelPage() {
  const router = useRouter();
  const [showToken, setShowToken] = useState(false);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testError, setTestError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: "",
      botToken: "",
      chatId: "",
      threadId: "",
    },
  });

  const testConnection = async () => {
    const values = getValues();
    if (!values.botToken || !values.chatId) {
      setTestError("Please enter bot token and chat ID first");
      setTestStatus("error");
      return;
    }

    setTestStatus("testing");
    setTestError(null);

    // TODO: Integrate with API to test Telegram connection
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate success/failure randomly for demo
    const success = Math.random() > 0.3;
    if (success) {
      setTestStatus("success");
    } else {
      setTestStatus("error");
      setTestError("Could not send test message. Check your credentials.");
    }
  };

  const onSubmit = async (data: ChannelFormData) => {
    // TODO: Integrate with API
    console.log("Creating channel:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/dashboard/channels");
  };

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
            <div className="flex items-center gap-3 rounded-lg border border-sky-500/30 bg-sky-500/5 p-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-sky-500/10">
                <TelegramLogo className="size-6 text-sky-500" weight="fill" />
              </div>
              <div>
                <p className="font-medium">Telegram</p>
                <p className="text-sm text-muted-foreground">
                  Send messages to a Telegram group or channel
                </p>
              </div>
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
                      <EyeSlash className="size-4" />
                    ) : (
                      <Eye className="size-4" />
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Channel"}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/channels">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
