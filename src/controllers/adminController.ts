import { Request, Response } from "express";
import adminService from "../services/adminService";
import { ReturnData } from "../configs/interfaces";

const addAccountController = async (req: Request, res: Response): Promise<any> => {
    try {
        const {name, gender, roleId, salaryId} = req.body;
        if (name.length == 0 || gender.length == 0 || roleId == 0) {
            return res.status(200).json({
                message: "Thông tin cần phải nhập đầy đủ",
                data: false,
                code: 1
            });
        }
        if (roleId != 1) {
            if (salaryId == 0) {
                return res.status(200).json({
                    message: "Thông tin cần phải nhập đầy đủ",
                    data: false,
                    code: 1
                });
            }
        }
        let result: ReturnData;
        if (roleId != 1) {
            result = await adminService.addAccountService(name, gender, roleId, salaryId);
        } else {
            result = await adminService.addAccountService(name, gender, roleId, 0);
        }
        return res.status(200).json({
            message: result.message,
            data: result.data,
            code: result.code
        });
    } catch(e) {
        console.log(e)
        return res.status(500).json({
            message: "Xảy ra lỗi ở controller",
            data: false,
            code: -1
        })
    }
}

const getAccountListController = async (req: Request, res: Response): Promise<any> => {
    try {
        if (!req.query.currentPage) {
            return res.status(200).json({
                message: "Server không nhận được số trang hiện tại",
                data: false,
                code: 1
            })
        }
        const currentPage = parseInt(req.query.currentPage as string || '1');
        const result = await adminService.getAccountListService(currentPage);
        return res.status(200).json({
            message: result.message,
            data: result.data,
            code: result.code
        });
    } catch(e) {
        console.log(e);
        return res.status(500).json({
            message: "Xảy ra lỗi ở controller",
            data: false,
            code: -1
        })
    }
}

const findAccountController = async (req: Request, res: Response): Promise<any> => {
    try {
        let findValue: string = typeof req.query.findValue == "string" ? req.query.findValue : "";
        findValue = findValue.replace(/\s+/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); 
        if (!findValue || findValue.length == 0) {
            return res.status(200).json({
                message: "Không có dữ liệu tìm kiếm",
                data: false,
                code: 1
            })
        }
        const result = await adminService.findAccountService(findValue);
        return res.status(200).json({
            message: result.message,
            data: result.data,
            code: result.code
        })
    } catch(e) {
        console.log(e);
        return res.status(500).json({
            message: "Xảy ra lỗi ở controller",
            data: false,
            code: -1
        })
    }
}

const getAccountInformationController = async (req: Request, res: Response): Promise<any> => {
    try {
        const accountId: number = typeof req.query.accountId == "string" ? parseInt(req.query.accountId) : -1;
        if (accountId == -1) {
            return res.status(200).json({
                message: "Không có id của tài khoản",
                data: false,
                code: 1
            })
        }
        const result = await adminService.getAccountInformationService(accountId);
        return res.status(200).json({
            message: result.message,
            data: result.data,
            code: result.code
        })
    } catch(e) {
        console.log(e);
        return res.status(500).json({
            message: "Xảy ra lỗi ở controller",
            data: false,
            code: -1
        })
    }
}

export default {
    addAccountController, getAccountListController, findAccountController,
    getAccountInformationController
}