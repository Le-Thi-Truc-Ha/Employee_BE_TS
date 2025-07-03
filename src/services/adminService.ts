import { genSalt, hash } from "bcrypt-ts";
import { prisma, ReturnData } from "../configs/interfaces";

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

const getAccountService = async (currentPage: number): Promise<ReturnData> => {
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

export default {
    addAccountService, getAccountService
}