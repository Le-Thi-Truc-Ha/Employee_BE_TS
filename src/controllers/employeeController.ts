import { Request, Response } from "express";
import employeeService from "../services/employeeService";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ReturnData } from "../configs/interfaces";

const getDeductionController = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await employeeService.getDeductionService();
        return res.status(200).json({
            message: result.message,
            data: result.data,
            code: result.code
        })
    } catch(e) {
        return res.status(500).json({
            message: "Xảy ra lỗi ở controller",
            data: false,
            code: -1
        })
    }
}

const addWorkController = async (req: Request, res: Response): Promise<any> => {
    try {
        dayjs.extend(customParseFormat);
        const {accountId, date, startTime, endTime, isMopping, deductionDescription} = req.body;
        if (!accountId || !date || !startTime || !endTime || isMopping == undefined || isMopping == null) {
            return res.status(200).json({
                message: "Nhập đầy đủ thông tin trong form",
                data: false, 
                code: 1
            });
        }
        for (let i = 0; i < deductionDescription.length; i++) {
            if (deductionDescription[i].deductionTypeId != 1) {
                if (!parseInt(deductionDescription[i].quantity) || deductionDescription[i].quantity.length == 0) {
                    return res.status(200).json({
                        message: "Dữ liệu không hợp lệ",
                        data: false, 
                        code: 1
                    })
                }
            }
        }
        const parseStartTime = dayjs(startTime, "HH:mm");
        const parseEndTime = dayjs(endTime, "HH:mm");
        if (parseStartTime.isAfter(parseEndTime)) {
            return res.status(200).json({
                message: "Dữ liệu không hợp lệ",
                data: false,
                code: 1
            })
        }
        if (parseStartTime.isBefore(dayjs("06:00", "HH:mm")) || parseEndTime.isAfter(dayjs("22:30", "HH:mm"))) {
            return res.status(200).json({
                message: "Dữ liệu không hợp lệ",
                data: false,
                code: 1
            })
        }
        let roleId: number = -1;
        if (req.user && typeof req.user !== "string") {
            roleId = req.user?.roleId;
        }
        if (roleId != 1) {
            if (date != dayjs().format("DD/MM/YYYY")) {
                return res.status(200).json({
                    message: "Dữ liệu không hợp lệ",
                    data: false,
                    code: 1
                })
            }
        }
        
        const result = await employeeService.addWorkService(date, startTime, endTime, isMopping, accountId, deductionDescription);
        return res.status(200).json({
            message: result.message,
            data: result.data,
            code: result.code
        })
    } catch(e) {
        return res.status(500).json({
            message: "Xảy ra lỗi ở controller",
            data: false,
            code: -1
        })
    }
}

const getWorkListController = async (req: Request, res: Response): Promise<any> => {
    try {
        const accountId = typeof req.query.accountId === 'string' ? parseInt(req.query.accountId, 10) : -1;
        const month = typeof req.query.month === 'string' ? parseInt(req.query.month, 10) : -1;
        const year = typeof req.query.year === 'string' ? parseInt(req.query.year, 10) : -1;
        if (accountId == -1 || month == -1 || year == -1) {
            return res.status(200).json({
                message: "Dữ liệu không hợp lệ",
                data: false,
                code: 1
            })
        }

        if (req.user && typeof req.user != "string") {
            if (req.user.roleId == 2) {
                if (req.user.id != accountId) {
                    return res.status(200).json({
                        message: "Không có quyền truy cập",
                        data: false,
                        code: 1
                    });
                }
            }
        }

        const result = await employeeService.getWorkListService(accountId, month, year);
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

const deleteWorkController = async (req: Request, res: Response): Promise<any> => {
    try {
        const workId = typeof req.query.workId == "string" ? parseInt(req.query.workId, 10) : -1;
        const accountId = typeof req.query.accountId == "string" ? parseInt(req.query.accountId, 10) : -1;
        
        if (workId == -1 || accountId == -1) {
            return res.status(200).json({
                message: "Không tìm thấy ca làm",
                data: false,
                code: 1
            })
        }

        if (req.user && typeof req.user != "string") {
            if (req.user.roleId == 2) {
                if (req.user.id != accountId) {
                    return res.status(200).json({
                        message: "Không có quyền truy cập",
                        data: false,
                        code: 1
                    });
                }
            }
        }

        const result: ReturnData = await employeeService.deleteWorkService(workId, accountId);
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

const getWorkController = async (req: Request, res: Response): Promise<any> => {
    try {
        const workId = typeof req.query.workId == "string" ? parseInt(req.query.workId, 10) : -1;
        if (workId == -1) {
            return res.status(200).json({
                message: "Không tìm thấy ca làm",
                data: false,
                code: 1
            })
        }
        const result: ReturnData = await employeeService.getWorkService(workId);
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

const updateWorkController = async (req: Request, res: Response): Promise<any> => {
    try {
        dayjs.extend(customParseFormat);
        const {accountId, workId, date, startTime, endTime, isMopping, deductionDescription, deductionDelete, salary} = req.body;
        if (!accountId || !workId || !date || !startTime || !endTime || !deductionDescription || !deductionDelete || isMopping == undefined) {
            return res.status(200).json({
                message: "Nhập đầy đủ thông tin trong form",
                data: false, 
                code: 1
            });
        }
        for (let i = 0; i < deductionDescription.length; i++) {
            if (deductionDescription[i].deductionTypeId != 1) {
                if (!parseInt(deductionDescription[i].quantity) || deductionDescription[i].quantity.length == 0) {
                    return res.status(200).json({
                        message: "Dữ liệu không hợp lệ",
                        data: false, 
                        code: 1
                    })
                }
            }
        }
        const parseStartTime = dayjs(startTime, "HH:mm");
        const parseEndTime = dayjs(endTime, "HH:mm");
        if (parseStartTime.isAfter(parseEndTime)) {
            return res.status(200).json({
                message: "Dữ liệu không hợp lệ",
                data: false,
                code: 1
            })
        }
        if (parseStartTime.isBefore(dayjs("06:00", "HH:mm")) || parseEndTime.isAfter(dayjs("22:30", "HH:mm"))) {
            return res.status(200).json({
                message: "Dữ liệu không hợp lệ",
                data: false,
                code: 1
            })
        }
        
        const result = await employeeService.updateWorkService(workId, date, startTime, endTime, isMopping, accountId, deductionDescription, deductionDelete, salary);
        return res.status(200).json({
            message: result.message,
            data: result.data,
            code: result.code
        })
    } catch(e) {
        return res.status(500).json({
            message: "Xảy ra lỗi ở controller",
            data: false,
            code: -1
        })
    }
}

const findWorkController = async (req: Request, res: Response): Promise<any> => {
    try {
        let findValue = typeof req.query.findValue == "string" ? req.query.findValue : "";
        findValue = findValue.replace(/\s+/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); 
        if (!findValue || findValue.length == 0) {
            return res.status(200).json({
                message: "Không có dữ liệu tìm kiếm",
                data: false,
                code: 1
            })
        }
        if (findValue.includes("/")) {
            const newArray = findValue.split("/").filter((item) => (item != "")).map((item) => (item.padStart(2, "0")));
            findValue = newArray.join("/");
        }
        const month = typeof req.query.month === 'string' ? parseInt(req.query.month, 10) : -1;
        const year = typeof req.query.year === 'string' ? parseInt(req.query.year, 10) : -1;
        if (month == -1 || year == -1) {
            return res.status(200).json({
                message: "Dữ liệu không hợp lệ",
                data: false,
                code: 1
            })
        }
        let accountId: number = -1;
        if (req.user && typeof req.user !== "string") {
            accountId = req.user?.id;
        }
        const result = await employeeService.findWorkService(findValue, accountId, month, year);
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

const getSalaryDeductionController = async (req: Request, res: Response): Promise<any> => {
    try {
        const {workIdList, month, year} = req.body;
        if (!workIdList || month == undefined || !year) {
            return res.status(200).json({
                message: "Không có dữ liệu ca làm",
                data: false,
                code: 1
            })
        }
        const date = `/${parseInt(month + 1).toString().padStart(2, "0")}/${year}`
        const result = await employeeService.getSalaryDeductionService(workIdList, date);
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
    getDeductionController, addWorkController, getWorkListController, deleteWorkController,
    getWorkController, updateWorkController, findWorkController, getSalaryDeductionController
}