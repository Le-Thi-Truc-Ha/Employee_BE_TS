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
                    {status: {
                        in: [1, 2]
                    }},
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

const updateEmployeeAccountService = async (
    employeeId: number, 
    name: string, 
    gender: string, 
    userName: string, 
    roleId: number, 
    salaryId: number, 
    salaryPlusId: number
): Promise<ReturnData> => {
    try {
        const existEmployee = await prisma.account.findUnique({
            where: {id: employeeId}
        });
        if (!existEmployee) {
            return({
                message: "Không tìm thấy tài khoản nhân viên",
                data: false,
                code: 1
            })
        }

        const duplicateAccount = await prisma.account.findFirst({
            where: {
                AND: [
                    {userName: userName},
                    {id: {
                        not: employeeId
                    }}
                ]
            }
        });
        if (duplicateAccount) {
            return({
                message: "Tên đăng nhập đã tồn tại",
                data: false,
                code: 1
            })
        }
        const updateEmployee = await prisma.account.update({
            where: {id: employeeId},
            data: {
                name: name,
                gender: gender,
                userName: userName,
                roleId: roleId,
                salaryId: salaryId,
                salaryPlusId: salaryPlusId == -1 ? null : salaryPlusId
            }
        })
        if (!updateEmployee) {
            return({
                message: "Cập nhật không thành công",
                data: false,
                code: 1
            })
        }
        return({
            message: "Cập nhật thành công",
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

const resetEmployeePasswordService = async (employeeId: number, newPassword: string): Promise<ReturnData> => {
    try {
        const existEmployee = await prisma.account.findUnique({
            where: {id: employeeId},
            select: {
                id: true
            }
        });
        if (!existEmployee) {
            return({
                message: "Không tìm thấy tài khoản nhân viên",
                data: false,
                code: 1
            })
        }
        const salt = await genSalt(10);
        const hashPassword = await hash(newPassword, salt);
        const resetPassword = await prisma.account.update({
            where: {id: employeeId},
            data: {password: hashPassword}
        })
        if (!resetPassword) {
            return({
                message: "Đặt lại mật khẩu không thành công",
                data: false,
                code: 1
            })
        }
        return({
            message: "Đặt lại mật khẩu thành công",
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

const deleteEmployeeService = async (employeeId: number): Promise<ReturnData> => {
    try {
        const existEmployee = await prisma.account.findUnique({
            where: {id: employeeId},
            select: {id: true}
        });
        if (!existEmployee) {
            return({
                message: "Tài khoản nhân viên không tồn tại",
                data: false,
                code: 1
            });
        }
        const deleteEmployee = await prisma.account.delete({
            where: {id: employeeId}
        })
        if (!deleteEmployee) {
            return({
                message: "Xóa tài khoản thất bại",
                data: false,
                code: 1
            });
        }
        return({
            message: "Xóa tài khoản thành công",
            data: true,
            code: 0
        });
    } catch(e) {
        console.log(e);
        return({
            message: "Xảy ra lỗi ở service",
            data: false,
            code: -1
        })
    }
}

const getEmployeeListService = async (): Promise<ReturnData> => {
    try {
        const employeeList = await prisma.account.findMany({
            where: {
                AND: [
                    {status: 1},
                    {roleId: 2}
                ]
            }, 
            select: {
                id: true,
                name: true,
                gender: true
            }
        })
        return({
            message: "Lấy dữ liệu thành công",
            data: employeeList,
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

const addKeepSalaryService = async (idSelect: number[], date: string, salary: string, employeeId: number): Promise<ReturnData> => {
    try {
        const existEmployee = await prisma.account.findMany({
            where: {
                AND: [
                    {id: employeeId},
                    {status: 1}
                ]
            },
            select: {
                keepSalary: true
            }
        })
        if (existEmployee.length != 1) {
            return({
                message: "Dữ liệu không hợp lệ",
                data: false,
                code: 1
            })
        }
        const idString = idSelect.join("=");
        const result = await prisma.$transaction(async (tx) => {
            let addKeepSalary: any;
            let oldWorkId: number[] | undefined;
            if (!existEmployee[0].keepSalary) {
                addKeepSalary = await tx.keepSalary.create({
                    data: {
                        workId: idString,
                        date: date,
                        salary: salary,
                        status: 0,
                        accountId: employeeId
                    }
                })
            } else {
                const keepSalaryId = existEmployee[0].keepSalary.id;
                oldWorkId = existEmployee[0].keepSalary.workId?.split("=").map((item) => (parseInt(item)));
                addKeepSalary = await tx.keepSalary.update({
                    where: {id: keepSalaryId},
                    data: {
                        workId: idString,
                        date: date,
                        salary: salary,
                    }
                })
            }
            if (oldWorkId && oldWorkId.length > 0) {
                const updateOldWorkStatus = await tx.work.updateMany({
                    where: {
                        id: {
                            in: oldWorkId
                        }
                    },
                    data: {
                        status: 1
                    }
                })
            }
            
            const updateNewWorkStatus = await tx.work.updateMany({
                where: {
                    id: {
                        in: idSelect
                    }
                },
                data: {
                    status: 2
                }
            })
            return addKeepSalary;
        })
        return({
            message: "Thành công",
            data: result,
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

const updateSalaryDeductionService = async (newSalaryDeduction: {id: number, cost: number}[]): Promise<ReturnData> => {
    try {
        const result = await Promise.all(newSalaryDeduction.map(async (item) => {
            return await prisma.salaryDeduction.update({
                where: {id: item.id},
                data: {
                    cost: item.cost
                }
            })
        }))
        if (result.length == 0) {
            return({
                message: "Cập nhật thất bại",
                data: false,
                code: 1
            })
        }
        const idUpdate = result.map((item) => (item.id))
        return({
            message: "Cập nhật thành công",
            data: idUpdate,
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

const addMissShiftService = async (date: string): Promise<ReturnData> => {
    try {
        const missShiftId = await prisma.deductionType.findUnique({
            where: {
                name: "Bỏ ca"
            },
            select: {
                id: true,
                name: true,
                price: true
            }
        })
        if (!missShiftId) {
            return({
                message: "Không tìm thấy dữ liệu",
                data: false,
                code: 1
            })
        }
        const addMissShift = await prisma.salaryDeduction.create({
            data: {
                deductionTypeId: missShiftId.id,
                quantity: date,
                detail: missShiftId.name,
                cost: missShiftId.price
            }
        })
        if (!addMissShift) {
            return({
                message: "Xác nhận thất bại",
                data: false,
                code: 1
            })
        }
        return({
            message: "Xác nhận thành công",
            data: addMissShift,
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

const deleteSalaryDeductionService = async (salaryDeductionId: number[]): Promise<ReturnData> => {
    try {
        const result = await prisma.salaryDeduction.deleteMany({
            where: {
                id: {
                    in: salaryDeductionId
                }
            }
        });
        return({
            message: "Xóa thành công",
            data: result,
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

const payKeepSalaryService = async (employeeId: number, month: number, year: number): Promise<ReturnData> => {
    try {
        const existKeepSalary = await prisma.keepSalary.findFirst({
            where: {
                AND: [
                    {accountId: employeeId},
                    {status: 0}
                ]
            },
            select: {
                id: true
            }
        })
        if (!existKeepSalary) {
            return({
                message: "Không tìm thấy dữ liệu",
                data: false,
                code: 1
            })
        }
        const result = await prisma.$transaction(async (tx) => {
            const updateKeepSalary = await tx.keepSalary.update({
                where: {id: existKeepSalary.id},
                data: {
                    status: 1
                }
            });
            const createSummary = await tx.summaryWork.create({
                data: {
                    accountId: employeeId,
                    month: month + 1,
                    year: year,
                    keepSalaryId: existKeepSalary.id
                }
            })
            return createSummary;
        })
        return({
            message: "Thành công",
            data: result,
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

const cancelPayService = async (employeeId: number, month: number, year: number): Promise<ReturnData> => {
    try {
        const existKeepSalary = await prisma.keepSalary.findFirst({
            where: {
                AND: [
                    {accountId: employeeId},
                    {status: 1}
                ]
            },
            select: {
                id: true
            }
        })
        if (!existKeepSalary) {
            return({
                message: "Không tìm thấy dữ liệu",
                data: false,
                code: 1
            })
        }
        const result = await prisma.$transaction(async (tx) => {
            const updateKeepSalary = await tx.keepSalary.update({
                where: {id: existKeepSalary.id},
                data: {
                    status: 0
                }
            });
            const deleteSummary = await tx.summaryWork.delete({
                where: {
                    keySummaryWork: {month: month + 1, year: year, accountId: employeeId}
                }
            })
            return deleteSummary;
        })
        return({
            message: "Thành công",
            data: result,
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

const deleteKeepSalaryService = async (employeeId: number): Promise<ReturnData> => {
    try {
        const existKeepSalary = await prisma.keepSalary.findFirst({
            where: {
                accountId: employeeId
            },
            select: {
                id: true,
                workId: true,
                status: true
            }
        })
        if (!existKeepSalary) {
            return({
                message: "Không tìm thấy dữ liệu",
                data: false,
                code: 1
            })
        }
        if (existKeepSalary.status == 1) {
            return({
                message: "Không thể xóa lương đã trả",
                data: false,
                code: 1
            })
        }
        const workIdArray = existKeepSalary.workId?.split("=").map((item) => (parseInt(item))) ?? [];
        const result = await prisma.$transaction(async (tx) => {
            const deleteKeepSalary = await tx.keepSalary.delete({
                where: {id: existKeepSalary.id}
            })
            await Promise.all(workIdArray?.map(async (item) => {
                return await tx.work.update({
                    where: {id: item},
                    data: {
                        status: 1
                    }
                })
            }))
        })
        return({
            message: "Xóa thành công",
            data: workIdArray,
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

const getStepSalaryService = async (): Promise<ReturnData> => {
    try {
        const stepSalary = await prisma.salary.findMany();
        if (stepSalary.length == 0) {
            return({
                message: "Không tìm thấy dữ liệu",
                data: false,
                code: 1
            })
        }
        const deductionParent = await prisma.deductionType.findMany({
            where: {
                price: {
                    not: 0
                }
            },
            select: {
                id: true,
                name: true, 
                price: true
            }
        })
        const deductionChild = await prisma.deduction.findMany({
            select: {
                id: true,
                name: true,
                price: true
            }
        })
        const deduction: {id: number, typeId: number, name: string, price: number}[] = [
            ...deductionParent.map((item) => (
                {id: item.id, typeId: 1, name: item.name, price: item?.price ?? -1}
            )),
            ...deductionChild.map((item) => (
                {id: item.id, typeId: 2, name: item.name, price: item?.price ?? -1}
            ))
        ]
        return({
            message: "Lấy dữ liệu thành công",
            data: {
                salary: stepSalary,
                deduction: deduction
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

const updateStepSalaryService = async (newValue: {id: number, name: string, weekday: string, weekend: string}): Promise<ReturnData> => {
    try {
        const weekday: number = parseInt(newValue.weekday.substring(0, newValue.weekday.length - 1).replace(/,/g, ""));
        const weekend: number = parseInt(newValue.weekend.substring(0, newValue.weekend.length - 1).replace(/,/g, ""));
        const updateStepSalary = await prisma.salary.update({
            where: {id: newValue.id},
            data: {
                weekday: weekday,
                weekend: weekend
            }
        })
        if (!updateStepSalary) {
            return({
                message: "Cập nhật thất bại",
                data: false,
                code: 1
            })
        }
        return({
            message: "Cập nhật thành công",
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

const updateDeductionService = async (newValue: {key: string, stt: string, id: number, typeId: number, name: string, price: string}[]): Promise<ReturnData> => {
    try {
        for (let i = 0; i < newValue.length; i++) {
            if (Number.isNaN(parseInt(newValue[i].price.substring(0, newValue[i].price.length - 1).replace(/,/g, "")))) {
                return({
                    message: "Dữ liệu không hợp lệ",
                    data: false,
                    code: 1
                })
            }
        }
        const result = await Promise.all(newValue.map(async (item) => {
            if (item.typeId == 1) {
                return await prisma.deductionType.update({
                    where: {
                        id: item.id
                    },
                    data: {
                        price: parseInt(item.price.substring(0, item.price.length - 1).replace(/,/g, ""))
                    }
                })
            } else {
                return await prisma.deduction.update({
                    where: {
                        id: item.id
                    },
                    data: {
                        price: parseInt(item.price.substring(0, item.price.length - 1).replace(/,/g, ""))
                    }
                })
            }
        }))
        for (let i = 0; i < result.length; i++) {
            if (!result[i]) {
                return({
                    message: "Cập nhật thất bại",
                    data: false,
                    code: 1
                })
            }
        }
        return({
            message: "Cập nhật thành công",
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

const getWorkErrorService = async (): Promise<ReturnData> => {
    try {
        const workError = await prisma.workError.findMany();
        if (workError.length == 0) {
            return({
                message: "Không có dữ liệu",
                data: false,
                code: 1
            })
        }
        return({
            message: "Lấy dữ liệu thành công",
            data: workError,
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

const deleteWorkErrorService = async (deleteId: number[]): Promise<ReturnData> => {
    try {
        const result = await prisma.workError.deleteMany({
            where: {
                id: {
                    in: deleteId
                }
            }
        })
        if (deleteId.length > 0 && result.count == 0) {
            return({
                message: "Xóa thất bại",
                data: false,
                code: 1
            })
        }
        return({
            message: "Xóa thành công",
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

const findWorkService = async (date: string): Promise<ReturnData> => {
    try {
        const work = await prisma.work.findMany({
            where: {
                AND: [
                    {date: date},
                    {status: {
                        in: [1, 2]
                    }}
                ]
            }, 
            select: {
                id: true,
                startTime: true,
                endTime: true,
                account: {
                    select: {
                        name: true,
                        gender: true
                    }
                }
            }
        })
        return({
            message: "Tìm thành công",
            data: work,
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
    getAccountInformationService, updateEmployeeAccountService,
    resetEmployeePasswordService, deleteEmployeeService,
    getEmployeeListService, addKeepSalaryService, updateSalaryDeductionService,
    addMissShiftService, deleteSalaryDeductionService, payKeepSalaryService,
    cancelPayService, deleteKeepSalaryService, getStepSalaryService, updateStepSalaryService,
    updateDeductionService, getWorkErrorService, deleteWorkErrorService, findWorkService
}