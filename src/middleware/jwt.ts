import dotenv from "dotenv";
import jwt, { Secret } from "jsonwebtoken";
import { PayloadData, prisma } from "../configs/interfaces";
import { NextFunction, Request, Response } from "express";

dotenv.config();

const createJWT = (payload: PayloadData): any => {
    try {
        const key: Secret = (process.env.JWT_SECRET || "OTHERGOC2018");
        const token: string = jwt.sign(payload, key, {expiresIn: "1d"});
        return token;
    } catch(e) {
        console.log(e);
    }
}

const verifyToken = (token: string) => {
    try {
        const key: Secret = (process.env.JWT_SECRET || "OTHERGOC2018");
        const decoded = jwt.verify(token, key);
        return decoded;
    } catch(e) {
        console.log(e);
    }
}

const checkLogin = (req: Request, res: Response, next: NextFunction): any => {
    // const token = req.cookies?.token;
    // if (!token) {
    //     res.status(200).json({
    //         message: "Bạn chưa đăng nhập",
    //         data: false,
    //         code: 1,
    //     });
    //     return;
    // }

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(200).json({
            message: "Bạn chưa đăng nhập",
            data: false,
            code: 1,
        });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        res.status(200).json({
            message: "Token không hợp lệ",
            data: false,
            code: 1
        });
        return;
    }

    req.user = decoded;
    req.token = token;

    next();
}

const getPermission = async (roleId: number) => {
    try {
        const permissions = await prisma.role.findMany({
            where: {id: roleId},
            select: {
                permissions: {
                    select: {
                        url: true
                    }
                }
            }
        })
        return permissions ? permissions : [];
    } catch(e) {
        console.log(e);
    }
}

const checkPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.user && typeof req.user !== "string") {
        const permissions = await getPermission(req.user.roleId);

        if (permissions?.length == 0 || !permissions) {
            res.status(200).json({
                message: "Không có quyền truy cập",
                data: false,
                code: 1
            });
            return;
        }

        let currentPath = req.path;

        if (req.user.roleId == 1) {
            currentPath = "/admin" + currentPath;
        } else if (req.user.roleId == 2) {
            currentPath = "/employee" + currentPath;
        }

        let canAccess = permissions[0].permissions.some(item => item.url == currentPath);
        if (canAccess) {
            next();
        } else {
            res.status(200).json({
                message: "Không có quyền truy cập",
                data: false,
                code: 1
            });
            return;
        }
    } else {
        res.status(200).json({
            message: "Không thể xác thực người dùng",
            data: false,
            code: 1
        });
        return;
    }
}

export default {
    createJWT, verifyToken, checkLogin, checkPermission
}