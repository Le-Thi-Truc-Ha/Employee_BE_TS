-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "gender" TEXT,
    "email" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT,
    "roleId" INTEGER,
    "status" INTEGER,
    "salaryId" INTEGER,
    "keepSalaryId" INTEGER,
    "salaryPlusId" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "roleId" INTEGER,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salary" (
    "id" SERIAL NOT NULL,
    "weekday" INTEGER,
    "weekend" INTEGER,
    "name" TEXT NOT NULL,

    CONSTRAINT "Salary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeductionType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER,
    "title" TEXT,

    CONSTRAINT "DeductionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deduction" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER,
    "deductionTypeId" INTEGER,

    CONSTRAINT "Deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "salary" INTEGER,
    "isMopping" INTEGER,
    "accountId" INTEGER,
    "status" INTEGER,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryDeduction" (
    "id" SERIAL NOT NULL,
    "workId" INTEGER,
    "deductionTypeId" INTEGER,
    "deductionId" INTEGER,
    "quantity" TEXT,
    "detail" TEXT,
    "cost" INTEGER,

    CONSTRAINT "SalaryDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkError" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "workErrorType" INTEGER,

    CONSTRAINT "WorkError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeepSalary" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "salary" TEXT,
    "status" INTEGER,

    CONSTRAINT "KeepSalary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryPlus" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "plus" INTEGER,

    CONSTRAINT "SalaryPlus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userName_key" ON "Account"("userName");

-- CreateIndex
CREATE INDEX "Account_roleId_idx" ON "Account"("roleId");

-- CreateIndex
CREATE INDEX "Account_status_idx" ON "Account"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_url_key" ON "Permission"("url");

-- CreateIndex
CREATE INDEX "Permission_roleId_idx" ON "Permission"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Salary_name_key" ON "Salary"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DeductionType_name_key" ON "DeductionType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Deduction_name_key" ON "Deduction"("name");

-- CreateIndex
CREATE INDEX "Work_accountId_idx" ON "Work"("accountId");

-- CreateIndex
CREATE INDEX "Work_status_idx" ON "Work"("status");

-- CreateIndex
CREATE INDEX "SalaryDeduction_workId_idx" ON "SalaryDeduction"("workId");

-- CreateIndex
CREATE INDEX "KeepSalary_status_idx" ON "KeepSalary"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryPlus_name_key" ON "SalaryPlus"("name");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_keepSalaryId_fkey" FOREIGN KEY ("keepSalaryId") REFERENCES "KeepSalary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_salaryId_fkey" FOREIGN KEY ("salaryId") REFERENCES "Salary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_salaryPlusId_fkey" FOREIGN KEY ("salaryPlusId") REFERENCES "SalaryPlus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deduction" ADD CONSTRAINT "Deduction_deductionTypeId_fkey" FOREIGN KEY ("deductionTypeId") REFERENCES "DeductionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryDeduction" ADD CONSTRAINT "SalaryDeduction_deductionId_fkey" FOREIGN KEY ("deductionId") REFERENCES "Deduction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryDeduction" ADD CONSTRAINT "SalaryDeduction_deductionTypeId_fkey" FOREIGN KEY ("deductionTypeId") REFERENCES "DeductionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryDeduction" ADD CONSTRAINT "SalaryDeduction_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE SET NULL ON UPDATE CASCADE;
