import { compare, genSalt, hash } from "bcrypt-ts";
import { PayloadData, prisma, ReturnData } from "../configs/interfaces";
import jwt from "../middleware/jwt";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(customParseFormat);

const loginService = async (username: string, password: string): Promise<ReturnData> => {
    try {
        const existAccount = await prisma.account.findFirst({
            where: {
                AND: [
                    {userName: username},
                    {status: 1}
                ]
            },
            select: {
                id: true, 
                name: true, 
                userName: true, 
                gender: true, 
                roleId: true,
                password: true,
                keepSalary: {
                    where: {status: 0}
                }
            }
        });

        if (!existAccount) {
            return({
                message: "Tài khoản không tồn tại",
                data: false,
                code: 1
            })
        }

        const hashPassword: string = existAccount.password || "";
        const checkPassword: boolean = await compare(password, hashPassword);
        
        if (!checkPassword) {
            return({
                message: "Mật khẩu không đúng",
                data: false,
                code: 1
            });
        }

        const payload: PayloadData = {
            id: existAccount.id || -1, 
            roleId: existAccount.roleId || -1,
        }

        const token = jwt.createJWT(payload);

        return({
            message: "Đăng nhập thành công",
            data: {
                id: existAccount.id,
                roleId: existAccount.roleId,
                gender: existAccount.gender,
                token: token
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

const reloadPageService = async (decoded: any): Promise<ReturnData> => {
    try {
        const accountLogin = await prisma.account.findUnique({
            where: {id: decoded.id},
            select: {status: true, gender: true}
        }) 
        if (!accountLogin) {
            return({
                message: "Tài khoản không tồn tại",
                data: false,
                code: 1
            })
        }
        if (accountLogin.status != 1) {
            return({
                message: "Tài khoản không hoạt động",
                data: false,
                code: 1
            })
        }
        return({
            message: "Tài khoản hợp lệ",
            data: {
                decoded: decoded,
                gender: accountLogin.gender
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

const getProfileService = async (decoded: any): Promise<ReturnData> => {
    try {
        const existAccont = await prisma.account.findUnique({
            where: {id: decoded.id},
            select: {
                name: true,
                userName: true,
                salary: {
                    select: {
                        weekday: true,
                        weekend: true
                    }
                },
                keepSalary: {
                    where: {status: 0},
                    select: {
                        date: true,
                        salary: true
                    }
                },
                salaryPlus: {
                    select: {
                        plus: true
                    }
                }
            }
        });
        if (!existAccont) {
            return({
                message: "Không có thông tin",
                data: false,
                code: 1
            })
        }
        return({
            message: "Lấy thông tin thành công",
            data: existAccont,
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

const changeProfileService = async (decoded: any, name: string): Promise<ReturnData> => {
    try {
        const existAccount = await  prisma.account.findUnique({
            where: {id: decoded.id}
        })
        if (!existAccount) {
            return({
                message: "Tài khoản không tồn tại",
                data: false,
                code: 1
            })
        }

        const updateAccount = await prisma.account.update({
            where: {id: decoded.id},
            data: {
                name: name
            }
        });
        return({
            message: "Lưu thông tin thành công",
            data: true,
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

const changePasswordService = async (decoded: any, oldPass: string, newPass: string): Promise<ReturnData> => {
    try {
        const existAccount = await  prisma.account.findUnique({
            where: {id: decoded.id},
            select: {
                password: true
            }
        })
        if (!existAccount) {
            return({
                message: "Tài khoản không tồn tại",
                data: false,
                code: 1
            })
        }

        const hashPassword: string = existAccount.password || "";
        const checkPassword: boolean = await compare(oldPass, hashPassword);

        if (!checkPassword) {
            return({
                message: "Mật khẩu cũ không đúng",
                data: false,
                code: 1
            })
        }
        const salt = await genSalt(10);
        const hashNewPassword = await hash(newPass, salt);

        const updateAccount = await prisma.account.update({
            where: {id: decoded.id},
            data: {
                password: hashNewPassword
            }
        });

        return({
            message: "Đổi mật khẩu thành công",
            data: true,
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

const checkErrorWorkService = async (): Promise<ReturnData> => {
    try {
        dayjs.extend(utc);
        dayjs.extend(timezone);
        const dateNow = dayjs().tz("Asia/Ho_Chi_Minh");
        const dateBefore = dateNow.subtract(1, "day");
        const dateString = dateBefore.format("DD/MM/YYYY");
        const listWork = await prisma.work.findMany({
            where: {
                date: dateString
            }, 
            select: {
                startTime: true,
                endTime: true
            }
        })
        if (listWork.length == 0) {
            await prisma.workError.create({
                data: {
                    date: dateString,
                    workErrorType: 1  //1 - Thiếu ca, 2 - Dư ca
                }
            })
            return({
                message: "Kiểm tra thành công",
                data: true,
                code: 0
            })
        }
        let totalHour = 0;
        listWork.map((item) => {
            totalHour += Math.round((dayjs(item.endTime, "HH:mm").diff(dayjs(item.startTime, "HH:mm"), "hour", true)) * 10) / 10;
        });
        if (dateBefore.day() == 0) {
            if (totalHour > 44.5) {
                await prisma.workError.create({
                    data: {
                        date: dateString,
                        workErrorType: 2
                    }
                })
            } else if (totalHour < 44.5) {
                await prisma.workError.create({
                    data: {
                        date: dateString,
                        workErrorType: 1
                    }
                })
            }
        } else {
            if (totalHour > 38.5) {
                await prisma.workError.create({
                    data: {
                        date: dateString,
                        workErrorType: 2
                    }
                })
            } else if (totalHour < 38.5) {
                await prisma.workError.create({
                    data: {
                        date: dateString,
                        workErrorType: 1
                    }
                })
            }
        }
        return({
            message: "Kiểm tra thành công",
            data: true,
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
    loginService, reloadPageService, getProfileService, changeProfileService,
    changePasswordService, checkErrorWorkService
}