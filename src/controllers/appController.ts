import { Request, Response } from "express";
import { ReturnData } from "../configs/interfaces";
import appService from "../services/appService";
import jwt from "../middleware/jwt";

const awakeBackendController = (req: Request, res: Response): any => {
    return res.status(200).send("Awake Success");
}
const loginController = async (req: Request, res: Response): Promise<any> => {
    try {
        const {username, password} = req.body;
        if (!username || !password) {
            return res.status(200).json({
                message: "Nhập đủ thông tin đăng nhập",
                data: false,
                code: 1
            })
        }
        const result: ReturnData = await appService.loginService(username, password);
        if (result.code != 0) {
            return res.status(200).json({
                message: result.message,
                data: result.data,
                code: result.code
            })
        }
        res.cookie("token", result.data.token, {
            httpOnly: true, 
            secure: true,
            sameSite: "none",
            maxAge: 60 * 1000 * 60 * 24
        });
        return res.status(200).json({
            message: result.message,
            data: {
                id: result.data?.id,
                roleId: result.data?.roleId,
                gender: result.data?.gender
            },
            code: result.code
        })
    } catch(e) {
        console.log(e);
        return res.status(500).json({
            message:"Xảy ra lỗi ở controller",
            data: false,
            code: -1
        })
    }
}

const reloadPageController = async (req: Request, res: Response): Promise<any> => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(200).json({
            message: "Bạn chưa đăng nhập",
            data: false,
            code: 1,
        });
    }

    const decoded = jwt.verifyToken(token);

    if (!decoded) {
        return res.status(200).json({
            message: "Token không hợp lệ",
            data: false,
            code: 1
        });
    }

    const result: ReturnData = await appService.reloadPageService(decoded); 

    if (result.code == 0) {
        return res.status(200).json({
            message: "Token hợp lệ",
            data: result.data,
            code: 0
        })
    } else {
        return res.status(200).json({
            message: result.message,
            data: result.data,
            code: result.code
        })
    }
}

const logoutController = async (req: Request, res: Response): Promise<any> => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(200).json({
            message: "Bạn chưa đăng nhập",
            data: false,
            code: 1,
        });
    }

    const decoded = jwt.verifyToken(token);

    if (!decoded) {
        return res.status(200).json({
            message: "Token không hợp lệ",
            data: false,
            code: 1
        });
    }

    res.clearCookie("token", {
        httpOnly: true
    });

    return res.status(200).json({
        message: "Đăng xuất thành công",
        data: true,
        code: 0
    });
}

const getProfileController = async (req: Request, res: Response): Promise<any> => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(200).json({
            message: "Bạn chưa đăng nhập",
            data: false,
            code: 1,
        });
    }

    const decoded = jwt.verifyToken(token);

    if (!decoded) {
        return res.status(200).json({
            message: "Token không hợp lệ",
            data: false,
            code: 1
        });
    }

    try {
        const result = await appService.getProfileService(decoded);
        return res.status(200).json({
            message: result.message,
            data: result.data,
            code: result.code
        })
    } catch(e) {
        console.log(e);
        return res.status(500).json({
            message:"Xảy ra lỗi ở controller",
            data: false,
            code: -1
        })
    }
}

const changeProfileController = async (req: Request, res: Response): Promise<any> => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(200).json({
            message: "Bạn chưa đăng nhập",
            data: false,
            code: 1,
        });
    }

    const decoded = jwt.verifyToken(token);

    if (!decoded) {
        return res.status(200).json({
            message: "Token không hợp lệ",
            data: false,
            code: 1
        });
    }

    try {
        const {name} = req.body;
        if (!name) {
            return res.status(200).json({
                message: "Không đủ thông tin",
                daa: false,
                code: 1
            })
        }
        const result = await appService.changeProfileService(decoded, name);
        return res.status(200).json({
            message: result.message,
            data: result.data,
            code: result.code
        })
    } catch(e) {
        console.log(e);
        return res.status(500).json({
            message:"Xảy ra lỗi ở controller",
            data: false,
            code: -1
        })
    }
}

const changePasswordController = async (req: Request, res: Response): Promise<any> => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(200).json({
            message: "Bạn chưa đăng nhập",
            data: false,
            code: 1,
        });
    }

    const decoded = jwt.verifyToken(token);

    if (!decoded) {
        return res.status(200).json({
            message: "Token không hợp lệ",
            data: false,
            code: 1
        });
    }

    try {
        const {oldPass, newPass} = req.body;
        if (!oldPass || !newPass) {
            return res.status(200).json({
                message: "Không đủ thông tin",
                daa: false,
                code: 1
            })
        }
        const result = await appService.changePasswordService(decoded, oldPass, newPass);
        return res.status(200).json({
            message: result.message,
            data: result.data,
            code: result.code
        })
    } catch(e) {
        console.log(e);
        return res.status(500).json({
            message:"Xảy ra lỗi ở controller",
            data: false,
            code: -1
        })
    }
}

export default {
    awakeBackendController, loginController, reloadPageController, logoutController, 
    getProfileController, changeProfileController, changePasswordController
}