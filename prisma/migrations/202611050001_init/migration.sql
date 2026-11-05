-- OFFGRID: initial PostgreSQL schema. UUID defaults also support non-ORM inserts.
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'FREELANCER', 'CLIENT');

CREATE TABLE "User" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'TEAM_MEMBER',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Session" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "tokenHash" TEXT NOT NULL UNIQUE,
  "userId" UUID NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "PasswordReset" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "tokenHash" TEXT NOT NULL UNIQUE,
  "userId" UUID NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "AuthAttempt" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "count" INTEGER NOT NULL DEFAULT 1,
  "resetAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Brand" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "legalName" TEXT NOT NULL DEFAULT '',
  "cnpj" TEXT NOT NULL DEFAULT '',
  "segment" TEXT NOT NULL DEFAULT '',
  "website" TEXT NOT NULL DEFAULT '',
  "instagram" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "city" TEXT NOT NULL DEFAULT '',
  "notes" TEXT NOT NULL DEFAULT '',
  "ownerId" UUID NOT NULL,
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "BrandAccess" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "brandId" UUID NOT NULL,
  UNIQUE ("userId","brandId")
);

CREATE TABLE "Contact" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "brandId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Opportunity" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "stage" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT NOT NULL DEFAULT '',
  "brandId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Briefing" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "opportunityId" UUID NOT NULL UNIQUE,
  "objective" TEXT NOT NULL,
  "audience" TEXT NOT NULL DEFAULT '',
  "experience" TEXT NOT NULL DEFAULT '',
  "city" TEXT NOT NULL DEFAULT '',
  "participants" INTEGER,
  "budgetCents" INTEGER,
  "references" TEXT NOT NULL DEFAULT '',
  "restrictions" TEXT NOT NULL DEFAULT '',
  "notes" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'Rascunho',
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Meeting" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "opportunityId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "notes" TEXT NOT NULL DEFAULT ''
);

CREATE TABLE "Project" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'Contratação',
  "location" TEXT NOT NULL DEFAULT '',
  "eventDate" TIMESTAMP(3),
  "brandId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "archivedAt" TIMESTAMP(3)
);

CREATE TABLE "ProjectMember" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "projectId" UUID NOT NULL,
  "canManage" BOOLEAN NOT NULL DEFAULT false,
  "canFinance" BOOLEAN NOT NULL DEFAULT false,
  UNIQUE ("userId","projectId")
);

CREATE TABLE "Task" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'A fazer',
  "priority" TEXT NOT NULL DEFAULT 'Normal',
  "dueAt" TIMESTAMP(3),
  "projectId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Activity" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "actorId" UUID NOT NULL,
  "action" TEXT NOT NULL,
  "entityId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BrandAccess" ADD CONSTRAINT "BrandAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BrandAccess" ADD CONSTRAINT "BrandAccess_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Briefing" ADD CONSTRAINT "Briefing_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Brand_owner_archived_idx" ON "Brand" ("ownerId","archivedAt");
CREATE INDEX "Contact_brand_idx" ON "Contact" ("brandId");
CREATE INDEX "Opportunity_brand_stage_idx" ON "Opportunity" ("brandId","stage");
CREATE INDEX "Meeting_date_idx" ON "Meeting" ("startsAt");
CREATE INDEX "Project_brand_archived_idx" ON "Project" ("brandId","archivedAt");
CREATE INDEX "Task_project_status_idx" ON "Task" ("projectId","status");
CREATE INDEX "Activity_date_idx" ON "Activity" ("createdAt");
CREATE INDEX "Session_expires_idx" ON "Session" ("expiresAt");
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_stage_range" CHECK ("stage" BETWEEN 0 AND 11);
ALTER TABLE "Briefing" ADD CONSTRAINT "Briefing_budget_nonnegative" CHECK ("budgetCents" IS NULL OR "budgetCents" >= 0), ADD CONSTRAINT "Briefing_participants_nonnegative" CHECK ("participants" IS NULL OR "participants" >= 0);
