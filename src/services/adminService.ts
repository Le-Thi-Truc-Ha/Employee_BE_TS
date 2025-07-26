import { Salary, KeepSalary } from './../generated/prisma/index.d';
import { genSalt, hash } from "bcrypt-ts";
import { prisma, ReturnData } from "../configs/interfaces";
import employeeService from "./employeeService";
import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const addAccountService = async (name: string, gender: string, roleId: number, salaryId: number): Promise<ReturnData> => {
    try {
        let email: string = "";
        let userName: string = "";
        const password: string = "123456789";
        const status: number = 1;
        let randomNumber: string = "";

        for (let i = 0; i < 5; i++) {
            randomNumber += Math.floor(Math.random() * 10);
        }

        userName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").trim();            
        userName = userName.toLowerCase().concat(randomNumber);
        if (roleId == 1) {
            email = userName.concat("@admin.goc.com");
        } else {
            email = userName.concat("@employee.goc.com");
        }

        const existAccount = await prisma.account.findUnique({
            where: {
                userName: userName
            }
        })
        if (existAccount) {
            return({
                message: "Đã tồn tại tên đăng nhập",
                data: false,
                code: 1
            })
        }

        const salt = await genSalt(10);
        const hashPassword = await hash(password, salt);

        let newAccount;
        if (salaryId == 0) {
            newAccount = await prisma.account.create({
                data: {
                    name: name,
                    gender: gender,
                    email: email,
                    userName: userName,
                    password: hashPassword,
                    roleId: roleId,
                    status: status
                }
            })
        } else {
            newAccount = await prisma.account.create({
                data: {
                    name: name,
                    gender: gender,
                    email: email,
                    userName: userName,
                    password: hashPassword,
                    roleId: roleId,
                    status: status,
                    salaryId: salaryId
                }
            })
        }

        if (!newAccount) {
            return({
                message: "Tạo tài khoản không thành công",
                data: false,
                code: 1
            })
        }
        return({
            message: "Tạo tài khoản thành công",
            data: newAccount,
            code: 0
        })
    } catch(e) {
        console.log(e);
        return({
            message: "Xảy ra lỗi ở service",
            data: false,
            code: -1
        })
    }
};

const getAccountListService = async (currentPage: number): Promise<ReturnData> => {
    try {
        const total: number = await prisma.account.count({
            where: {
                AND: [
                    {status: 1},
                    {roleId: {not: 1}}
                ]
            }
        });

        const limit: number = 5;
        if ((currentPage - 1) * limit > total) {
            return({
                message: "Trang hiện tại không có dữ liệu",
                data: false,
                code: 1
            });
        }

        const offset: number = (currentPage - 1) * limit;

        const listAccount = await prisma.account.findMany({
            where: {
                AND: [
                    {status: 1},
                    {roleId: {not: 1}}
                ]
            },
            select: {
                id: true,
                name: true,
                userName: true
            },
            orderBy: {
                id: 'desc'
            },
            skip: offset,
            take: limit
        });

        if (listAccount.length == 0) {
            return({
                message: "Không có dữ liệu",
                data: false,
                code: 1
            })
        }

        return({
            message: "Lấy dữ liệu thành công",
            data: {listAccount, total},
            code: 0
        })
    } catch(e) {
        console.log(e);
        return({
            message: "Xảy ra lỗi ở service",
            data: false,
            code: -1
        })
    }
}

const findAccountService = async (findValue: string): Promise<ReturnData> => {
    try {
        const allAccount = await prisma.account.findMany({
            where: {
                AND: [
                    {status: 1},
                    {roleId: 2}
                ]
            },
            select: {
                id: true,
                name: true,
                userName: true
            }
        });
        const resultAccount = allAccount.filter((item) => {
            const name = item.name ? item.name.replace(/\s+/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
            if (name.includes(findValue)) {
                return item;
            }
        })
        return({
            message: "Tìm kiếm thành công",
            data: resultAccount,
            code: 0
        })
    } catch(e) {
        console.log(e);
        return({
            message: "Xảy ra lỗi ở service",
            data: false,
            code: -1
        })
    }
}

const getSummaryWork = async (accountId: number, year: string): Promise<ReturnData> => {
    try {
        const workSummary = await prisma.work.findMany({
            where: {
                AND: [
                    {status: 1},
                    {accountId: accountId},
                    {date: {
                        contains: year
                    }}
                ]
            },
            select: {
                date: true
            }
        })
        const countWork = Array(12).fill(0);
        workSummary.forEach((item) => {
            const dateArray: string[] = item.date?.split("/") ?? [];
            if (dateArray.length != 0) {
                const month = parseInt(dateArray[1], 10);
                if (month >= 1 && month <= 12) {
                    countWork[month - 1]++;
                }
            }
        })
        return({
            message: "Lấy dữ liệu thành công",
            data: countWork,
            code: 0
        })
    } catch(e) {
        console.log(e);
        return({
            message: "Xảy ra lỗi ở service",
            data: false,
            code: -1
        })
    }
}

const getAccountInformationService = async (accountId: number): Promise<ReturnData> => {
    try {
        const existAccount = await prisma.account.findMany({
            where: {
                AND: [
                    {id: accountId},
                    {status: 1}
                ]
            },
            select: {
                id: true,
                name: true,
                gender: true,
                userName: true,
                roleId: true,
                salary: {
                    select: {
                        id: true,
                        weekday: true,
                        weekend: true
                    }
                },
                keepSalary: {
                    where: {status: 0},
                    select: {
                        id: true,
                        date: true,
                        salary: true
                    }
                },
                salaryPlus: {
                    select: {
                        id: true,
                        plus: true
                    }
                }
            }
        });
        if (existAccount.length == 0) {
            return({
                message: "Không tìm thấy tài khoản",
                data: false,
                code: 1
            })
        }
        const startWork = await prisma.work.findFirst({
            where: {accountId: accountId},
            select: {
                date: true
            }
        })
        const year = dayjs().year();
        const workSummary: ReturnData = await getSummaryWork(accountId, year.toString());
        if (workSummary.code != 0) {
            return({
                message: workSummary.message,
                data: workSummary.data,
                code: workSummary.code
            })
        }
        const salaryPlus = await prisma.salaryPlus.findMany({
            select: {
                id: true,
                name: true
            }
        });
        const salary = await prisma.salary.findMany({
            select: {
                id: true,
                name: true
            }
        })
        return({
            message: "Lấy dữ liệu thành công",
            data: {
                accountData: existAccount[0],
                startWork: startWork,
                workSummary: workSummary.data,
                salary: salary,
                salaryPlus: salaryPlus
            },
            code: 0
        })
    } catch(e) {
        console.log(e);
        return({
            message: "Xảy ra lỗi ở service",
            data: false,
            code: -1
        })
    }
}

export default {
    addAccountService, getAccountListService, findAccountService,
    getAccountInformationService
}