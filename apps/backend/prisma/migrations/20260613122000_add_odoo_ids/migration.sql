-- AlterTable
ALTER TABLE "projects" ADD COLUMN "odooProjectId" INTEGER;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN "odooTicketId" INTEGER;
ALTER TABLE "tickets" ADD COLUMN "odooTaskId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "projects_odooProjectId_key" ON "projects"("odooProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_odooTicketId_key" ON "tickets"("odooTicketId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_odooTaskId_key" ON "tickets"("odooTaskId");
