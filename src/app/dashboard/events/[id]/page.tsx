"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  GitlabLogoSimple,
  TelegramLogo,
  Copy,
  Check,
  CheckCircle,
  XCircle,
  Clock,
  ArrowsClockwise,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEvent } from "@/hooks/use-events";

const statusColors = {
  RECEIVED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  PROCESSING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  PROCESSED: "bg-green-500/10 text-green-600 border-green-500/20",
  IGNORED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  INVALID: "bg-red-500/10 text-red-600 border-red-500/20",
  ERROR: "bg-red-500/10 text-red-600 border-red-500/20",
};

const deliveryStatusColors = {
  PENDING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  SCHEDULED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  SUCCESSFUL: "bg-green-500/10 text-green-600 border-green-500/20",
  FAILED: "bg-red-500/10 text-red-600 border-red-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  ON_HOLD: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const attemptStatusIcons = {
  PENDING: Clock,
  IN_PROGRESS: Clock,
  SUCCESSFUL: CheckCircle,
  FAILED: XCircle,
  TIMEOUT: XCircle,
  CANCELLED: XCircle,
};

const triggerLabels = {
  INITIAL: "Initial",
  AUTOMATIC_RETRY: "Auto Retry",
  MANUAL_RETRY: "Manual",
  BULK_RETRY: "Bulk",
  UNPAUSE: "Unpause",
};

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { data, isLoading, isError } = useEvent(id);
  const event = useMemo(() => (data?.success ? data.data : null), [data]);
  const [expandedDeliveries, setExpandedDeliveries] = useState<string[]>([]);

  useEffect(() => {
    if (event?.deliveries) {
      setExpandedDeliveries(event.deliveries.map((d: any) => d.id));
    }
  }, [event?.deliveries]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleDelivery = (deliveryId: string) => {
    setExpandedDeliveries((prev) =>
      prev.includes(deliveryId)
        ? prev.filter((id) => id !== deliveryId)
        : [...prev, deliveryId]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/events">
            <ArrowLeft className="size-4" />
            Back to Events
          </Link>
        </Button>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Clock className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Loading event…</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/events">
            <ArrowLeft className="size-4" />
            Back to Events
          </Link>
        </Button>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <XCircle className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Event not found</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/events">
          <ArrowLeft className="size-4" />
          Back to Events
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-orange-500/10">
            <GitlabLogoSimple
              className="size-6 text-orange-600"
              weight="fill"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {event.eventType}
              </h1>
              <Badge
                variant="outline"
                className={statusColors[event.status as keyof typeof statusColors]}
              >
                {event.status.toLowerCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              From {event.endpoint.name} •{" "}
              {new Date(event.receivedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <Button variant="outline">
          <ArrowsClockwise className="size-4" />
          Redeliver All
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Event Details */}
        <div className="space-y-6">
          {/* Headers */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Headers</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(event.headers, null, 2),
                      "headers"
                    )
                  }
                >
                  {copiedField === "headers" ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted/50 p-3 font-mono text-xs overflow-auto max-h-48">
                {Object.entries(event.headers as Record<string, any>).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="text-muted-foreground shrink-0 w-40">
                      {key}:
                    </span>
                    <span className="text-foreground break-all">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Body */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Payload</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(event.body, null, 2),
                      "body"
                    )
                  }
                >
                  {copiedField === "body" ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="rounded-lg bg-muted/50 p-3 font-mono text-xs overflow-auto max-h-96">
                {JSON.stringify(event.body, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Deliveries */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Deliveries ({event.deliveries.length})
          </h2>

          {event.deliveries.map((delivery: any) => (
            <Card key={delivery.id}>
              <CardHeader className="pb-3">
                <button
                  className="flex items-start justify-between w-full text-left"
                  onClick={() => toggleDelivery(delivery.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-sky-500/10">
                      <TelegramLogo
                        className="size-4 text-sky-500"
                        weight="fill"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-sm">
                        {delivery.channel.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        via {delivery.route.name}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        deliveryStatusColors[
                          delivery.status as keyof typeof deliveryStatusColors
                        ]
                      }
                    >
                      {delivery.status.toLowerCase()}
                    </Badge>
                    {expandedDeliveries.includes(delivery.id) ? (
                      <CaretUp className="size-4 text-muted-foreground" />
                    ) : (
                      <CaretDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
              </CardHeader>

              {expandedDeliveries.includes(delivery.id) && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Attempts ({delivery.attempts.length})
                    </p>
                    <div className="space-y-2">
                      {delivery.attempts.map((attempt: any, index: number) => {
                        const AttemptIcon =
                          attemptStatusIcons[
                            attempt.status as keyof typeof attemptStatusIcons
                          ] || Clock;
                        const isSuccess = attempt.status === "SUCCESSFUL";

                        return (
                          <div
                            key={attempt.id}
                            className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                          >
                            <AttemptIcon
                              className={`size-4 ${isSuccess ? "text-green-600" : "text-red-600"}`}
                              weight="fill"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  Attempt {index + 1}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {
                                    triggerLabels[
                                      attempt.trigger as keyof typeof triggerLabels
                                    ]
                                  }
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(attempt.startedAt).toLocaleTimeString()}
                                {attempt.errorMessage && (
                                  <span className="text-red-600 ml-2">
                                    {attempt.errorMessage}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className={`font-mono text-sm ${isSuccess ? "text-green-600" : "text-red-600"}`}>
                                {attempt.responseStatus ?? "-"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {attempt.durationMs ?? 0}ms
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {delivery.status === "FAILED" && (
                      <Button size="sm" variant="outline" className="w-full mt-2">
                        <ArrowsClockwise className="size-4" />
                        Retry Delivery
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
