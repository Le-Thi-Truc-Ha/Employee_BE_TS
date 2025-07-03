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

const getAccountController = async (req: Request, res: Response): Promise<any> => {
    try {
        if (!req.query.currentPage) {
            return res.status(200).json({
                message: "Server không nhận được số trang hiện tại",
                data: false,
                code: 1
            })
        }
        const currentPage = parseInt(req.query.currentPage as string || '1');
        const result = await adminService.getAccountService(currentPage);
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

export default {
    addAccountController, getAccountController
}