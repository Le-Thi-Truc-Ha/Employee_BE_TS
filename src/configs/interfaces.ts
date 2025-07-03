import { PrismaClient } from "../generated/prisma";

export interface ReturnData {
    message: string,
    data: any,
    code: number
}

export interface PayloadData {
    id: number,
    roleId: number
}

export const prisma = new PrismaClient();