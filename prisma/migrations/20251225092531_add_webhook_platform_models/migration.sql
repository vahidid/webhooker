-- CreateEnum
CREATE TYPE "SignatureAlgorithm" AS ENUM ('HMAC_SHA1', 'HMAC_SHA256', 'HMAC_SHA512', 'NONE');

-- CreateEnum
CREATE TYPE "EndpointStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('TELEGRAM', 'SLACK', 'DISCORD', 'ROCKETCHAT', 'MATTERMOST', 'MICROSOFT_TEAMS', 'WEBHOOK', 'EMAIL');

-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED', 'ERROR');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED');

-- CreateEnum
CREATE TYPE "RetryStrategy" AS ENUM ('NONE', 'LINEAR', 'EXPONENTIAL');

-- CreateEnum
CREATE TYPE "TemplateFormat" AS ENUM ('TEXT', 'MARKDOWN', 'HTML', 'JSON');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'IGNORED', 'INVALID', 'ERROR');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'SUCCESSFUL', 'FAILED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "AttemptTrigger" AS ENUM ('INITIAL', 'AUTOMATIC_RETRY', 'MANUAL_RETRY', 'BULK_RETRY', 'UNPAUSE');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUCCESSFUL', 'FAILED', 'TIMEOUT', 'CANCELLED');

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "signatureHeader" TEXT,
    "signatureAlgo" "SignatureAlgorithm",
    "eventTypes" JSONB NOT NULL,
    "docsUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Endpoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "secret" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "allowedEvents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "EndpointStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,

    CONSTRAINT "Endpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ChannelType" NOT NULL,
    "credentials" JSONB NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "maxDeliveryRate" INTEGER,
    "status" "ChannelStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filterExpression" TEXT,
    "delaySeconds" INTEGER NOT NULL DEFAULT 0,
    "retryStrategy" "RetryStrategy" NOT NULL DEFAULT 'EXPONENTIAL',
    "retryCount" INTEGER NOT NULL DEFAULT 5,
    "retryIntervalMs" INTEGER NOT NULL DEFAULT 60000,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" "RouteStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "templateId" TEXT,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" TEXT NOT NULL,
    "format" "TemplateFormat" NOT NULL DEFAULT 'TEXT',
    "examplePayload" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "headers" JSONB NOT NULL,
    "body" JSONB NOT NULL,
    "queryParams" JSONB NOT NULL DEFAULT '{}',
    "path" TEXT,
    "sourceIp" TEXT,
    "userAgent" TEXT,
    "signatureValid" BOOLEAN,
    "idempotencyKey" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "endpointId" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "transformedBody" JSONB,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextAttemptAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "trigger" "AttemptTrigger" NOT NULL,
    "requestBody" JSONB,
    "requestHeaders" JSONB,
    "responseStatus" INTEGER,
    "responseBody" TEXT,
    "responseHeaders" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "status" "AttemptStatus" NOT NULL DEFAULT 'PENDING',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "deliveryId" TEXT NOT NULL,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- CreateIndex
CREATE INDEX "Provider_name_idx" ON "Provider"("name");

-- CreateIndex
CREATE INDEX "Provider_isActive_idx" ON "Provider"("isActive");

-- CreateIndex
CREATE INDEX "Endpoint_organizationId_idx" ON "Endpoint"("organizationId");

-- CreateIndex
CREATE INDEX "Endpoint_providerId_idx" ON "Endpoint"("providerId");

-- CreateIndex
CREATE INDEX "Endpoint_status_idx" ON "Endpoint"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Endpoint_organizationId_slug_key" ON "Endpoint"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "Channel_organizationId_idx" ON "Channel"("organizationId");

-- CreateIndex
CREATE INDEX "Channel_type_idx" ON "Channel"("type");

-- CreateIndex
CREATE INDEX "Channel_status_idx" ON "Channel"("status");

-- CreateIndex
CREATE INDEX "Route_organizationId_idx" ON "Route"("organizationId");

-- CreateIndex
CREATE INDEX "Route_endpointId_idx" ON "Route"("endpointId");

-- CreateIndex
CREATE INDEX "Route_channelId_idx" ON "Route"("channelId");

-- CreateIndex
CREATE INDEX "Route_status_idx" ON "Route"("status");

-- CreateIndex
CREATE INDEX "MessageTemplate_organizationId_idx" ON "MessageTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "Event_endpointId_idx" ON "Event"("endpointId");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_receivedAt_idx" ON "Event"("receivedAt");

-- CreateIndex
CREATE INDEX "Event_idempotencyKey_idx" ON "Event"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Delivery_eventId_idx" ON "Delivery"("eventId");

-- CreateIndex
CREATE INDEX "Delivery_routeId_idx" ON "Delivery"("routeId");

-- CreateIndex
CREATE INDEX "Delivery_status_idx" ON "Delivery"("status");

-- CreateIndex
CREATE INDEX "Delivery_scheduledFor_idx" ON "Delivery"("scheduledFor");

-- CreateIndex
CREATE INDEX "Delivery_nextAttemptAt_idx" ON "Delivery"("nextAttemptAt");

-- CreateIndex
CREATE INDEX "Delivery_status_scheduledFor_idx" ON "Delivery"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "Delivery_status_nextAttemptAt_idx" ON "Delivery"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "Attempt_deliveryId_idx" ON "Attempt"("deliveryId");

-- CreateIndex
CREATE INDEX "Attempt_status_idx" ON "Attempt"("status");

-- CreateIndex
CREATE INDEX "Attempt_startedAt_idx" ON "Attempt"("startedAt");

-- AddForeignKey
ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MessageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
