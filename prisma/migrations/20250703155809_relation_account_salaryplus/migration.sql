/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Deduction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KeepSalary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Salary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalaryDeduction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalaryPlus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Work` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkError` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_keepSalaryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_salaryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Permission" DROP CONSTRAINT "Permission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SalaryDeduction" DROP CONSTRAINT "SalaryDeduction_workId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Work" DROP CONSTRAINT "Work_accountId_fkey";

-- DropTable
DROP TABLE "public"."Account";

-- DropTable
DROP TABLE "public"."Deduction";

-- DropTable
DROP TABLE "public"."KeepSalary";

-- DropTable
DROP TABLE "public"."Permission";

-- DropTable
DROP TABLE "public"."Role";

-- DropTable
DROP TABLE "public"."Salary";

-- DropTable
DROP TABLE "public"."SalaryDeduction";

-- DropTable
DROP TABLE "public"."SalaryPlus";

-- DropTable
DROP TABLE "public"."Work";

-- DropTable
DROP TABLE "public"."WorkError";

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
CREATE TABLE "Deduction" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER,

    CONSTRAINT "Deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMPTZ(6),
    "startTime" TIMESTAMPTZ(6),
    "endTime" TIMESTAMPTZ(6),
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
    "quantity" INTEGER,
    "detail" TEXT,
    "cost" INTEGER,

    CONSTRAINT "SalaryDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkError" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMPTZ(6),
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
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_url_key" ON "Permission"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Salary_name_key" ON "Salary"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Deduction_name_key" ON "Deduction"("name");

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
ALTER TABLE "Work" ADD CONSTRAINT "Work_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryDeduction" ADD CONSTRAINT "SalaryDeduction_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE SET NULL ON UPDATE CASCADE;
