// import { PrismaClient } from "../generated/prisma";
import { PrismaClient } from '@prisma/client';

export interface ReturnData {
    message: string,
    data: any,
    code: number
}

export interface PayloadData {
    id: number,
    roleId: number
}

export interface DeductionDescription {
  deductionTypeId: number, 
  deductionId: number,
  quantity: string,
  validate: boolean,
  detail: string
}

export interface DataSalaryDeduction {
  id: number,
  date: string,
  detail: string,
  quantity: string,
  cost: string
}

export const prisma = new PrismaClient();