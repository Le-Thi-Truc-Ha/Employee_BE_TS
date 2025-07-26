import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DataSalaryDeduction, DeductionDescription, prisma, ReturnData } from "../configs/interfaces";
import { sendEmail } from "../configs/email";
import { PrismaClientKnownRequestError } from "../generated/prisma/runtime/library";

dayjs.extend(customParseFormat);

const getDeductionService = async (): Promise<ReturnData> => {
    try {
        const deductionList = await prisma.deductionType.findMany({
            select: {
                id: true,
                name: true,
                title: true,
                deductions: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
        if (deductionList.length == 0) {
            return({
                message: "Không tìm thấy dữ liệu",
                data: false,
                code: 1
            })
        }
        return({
            message: "Lấy dữ liệu thành công",
            data: deductionList,
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

const addWorkService = async (date: string, startTime: string, endTime: string, isMopping: number, accountId: number, deductionSelect: DeductionDescription[]): Promise<ReturnData> => {
    try {
        const existAccount = await prisma.account.findUnique({
            where: {id: accountId},
            select: {
                name: true,
                userName: true,
                salary: {
                    select: {
                        weekday: true,
                        weekend: true
                    }
                },
                salaryPlus: {
                    select: {
                        plus: true
                    }
                }
            }
        });
        if (!existAccount) {
            return({
                message: "Tài khoản không tồn tại",
                data: false,
                code: 1
            });
        }
        let weekdaySalary: number = existAccount.salary?.weekday || 0;
        let weekendSalary: number = existAccount.salary?.weekend || 0;
        if (existAccount.salaryPlus?.plus) {
            weekdaySalary += existAccount.salaryPlus?.plus;
            weekendSalary += existAccount.salaryPlus?.plus;
        }
        let salary: number = 0;
        if (dayjs(date, "DD/MM/YYYY").day() == 0) {
            salary = weekendSalary;
        } else {
            salary = weekdaySalary;
        }
        const priceDeductions = await Promise.all(
            deductionSelect.map(async (item, index) => {
                if (item.deductionId == 0) {
                    let titleDeduction = await prisma.deductionType.findUnique({
                        where: {id: item.deductionTypeId},
                        select: {
                            title: true,
                            price: true
                        }
                    })
                    if (titleDeduction?.title == "Mô tả") {
                        await sendEmail(
                            "hale071204@gmail.com",
                            "Ca làm cần chú ý lỗi",
                            `
                                <h1>Tên: ${existAccount.name}</h1>
                                <h1>Username: ${existAccount.userName}</h1>
                                <h1>Ca làm ngày: ${date}\n</h1>
                                <h1>Thời gian: ${startTime} - ${endTime}\n</h1>
                                <h1>Nội dung: ${item.detail}</h1>
                            `
                        )
                        return 0;
                    } else if (titleDeduction?.title == "Số tiền") {
                        return parseInt(item.quantity);
                    } else if (titleDeduction?.title == "Số phút") {
                        if (parseInt(item.quantity) < 30) {
                            return parseInt(item.quantity) * 4000;
                        } else {
                            return Math.round((100000 / 30 * parseInt(item.quantity)) * 10) / 10;
                        }
                    } else if (titleDeduction?.title == "Số lượng") {
                        return (titleDeduction.price || 1) * parseInt(item.quantity);
                    }
                } else {
                    const priceDeduction = await prisma.deduction.findUnique({
                        where: {id: item.deductionId},
                        select: {
                            price: true
                        }
                    })
                    return (priceDeduction?.price || 1) * parseInt(item.quantity);
                }
            })
        )
        const result = await prisma.$transaction(async (tx) => {
            const addWork = await tx.work.create({
                data: {
                    date: date,
                    startTime: startTime,
                    endTime: endTime,
                    salary: salary,
                    isMopping: isMopping,
                    accountId: accountId,
                    status: 1
                }
            })
            const addSalaryDeduction = await tx.salaryDeduction.createMany({
                data: deductionSelect.map((item, index) => ({
                    workId: addWork.id,
                    deductionTypeId: item.deductionTypeId,
                    deductionId: item.deductionId == 0 ? null : item.deductionId,
                    quantity: item.quantity,
                    detail: item.detail,
                    cost: priceDeductions[index]
                }))
            })
            return addWork;
        })
        
        return({
            message: "Thêm ca làm thành công",
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

const getWorkListService = async (accountId: number, roleId: number, month: number, year: number): Promise<ReturnData> => {
    try {
        const existAccount = await prisma.account.findUnique({
            where: {id: accountId},
            select: {
                works: {
                    where: {
                        AND: [
                            {status: 1},
                            {date: {
                                contains: `${month + 1 < 10 ? `/0${month + 1}/${year}` : `/${month + 1}/${year}`}`
                            }}
                        ]
                    }
                }
            }
        })
        if (!existAccount) {
            return({
                message: "Tài khoản không tồn tại",
                data: false,
                code: 1
            })
        }
        return({
            message: "Lấy thông tin thành công",
            data: existAccount.works,
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

const deleteWorkService = async (workId: number, accountId: number): Promise<ReturnData> => {
    try {
        const deleteWorkTransaction = await prisma.$transaction(async (tx) => {
            const deleteSalaryDeduction = await tx.salaryDeduction.deleteMany({
                where: {
                    workId: workId
                }
            });

            const deleteWork = await tx.work.deleteMany({
                where: {
                    AND: [
                        {id: workId},
                        {accountId: accountId}
                    ]
                }
            })

            if (deleteWork.count == 0) {
                throw new Error("Không tìm thấy ca làm");
            }
            return deleteWork
        })
        if (!deleteWorkTransaction) {
            return({
                message: "Xóa ca làm không thành công",
                data: false,
                code: 1
            })
        }
        return({
            message: "Xóa ca làm thành công",
            data: true,
            code: 0
        })
    } catch(e: any) {
        console.log(e);
        if (e instanceof PrismaClientKnownRequestError && e.code == "P2025") {
            return({
                message: "Không tìm thấy ca làm",
                data: false,
                code: -1
            })
        }
        return({
            message: e.message || "Xảy ra lỗi ở service",
            data: false,
            code: -1
        })
    }
}

const getWorkService = async (workId: number): Promise<ReturnData> => {
    try {
        const workInformationTransaction = await prisma.$transaction(async (tx) => {
            const workInformation = await tx.work.findUnique({
                where: {id: workId},
                select: {
                    date: true,
                    startTime: true,
                    endTime: true,
                    isMopping: true
                }
            });

            const salaryDeduction = await prisma.salaryDeduction.findMany({
                where: {workId: workId},
                select: {
                    deductionTypeId: true,
                    deductionId: true,
                    quantity: true,
                    detail: true
                }
            })
            return {
                date: workInformation?.date,
                startTime: workInformation?.startTime,
                endTime: workInformation?.endTime,
                isMopping: workInformation?.isMopping,
                salaryDeductions: salaryDeduction
            }
        })
        if (!workInformationTransaction.date) {
            return({
                message: "Không tìm thấy ca làm",
                data: false,
                code: 1
            })
        }
        return({
            message: "Lấy dữ liệu thành công",
            data: workInformationTransaction,
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

const updateWorkService = async (workId: number, date: string, startTime: string, endTime: string, isMopping: number, accountId: number, deductionDescription: DeductionDescription[]): Promise<ReturnData> => {
    try {
        dayjs.extend(customParseFormat);
        const existWork = await prisma.work.findMany({
            where: {
                AND: [
                    {id: workId},
                    {accountId: accountId}
                ]
            },
            select: {
                date: true
            }
        })
        if (!existWork) {
            return({
                message: "Không tìm thấy ca làm",
                data: false,
                code: 1
            })
        }
        const existAccount = await prisma.account.findUnique({
            where: {id: accountId},
            select: {
                name: true,
                userName: true,
                salary: {
                    select: {
                        weekday: true,
                        weekend: true
                    }
                },
                salaryPlus: {
                    select: {
                        plus: true
                    }
                }
            }
        });
        if (!existAccount) {
            return({
                message: "Tài khoản không tồn tại",
                data: false,
                code: 1
            });
        }
        let weekdaySalary: number = existAccount.salary?.weekday || 0;
        let weekendSalary: number = existAccount.salary?.weekend || 0;
        if (existAccount.salaryPlus?.plus) {
            weekdaySalary += existAccount.salaryPlus?.plus;
            weekendSalary += existAccount.salaryPlus?.plus;
        }
        let salary: number = 0;
        if (dayjs(date, "DD/MM/YYYY").day() == 0) {
            salary = weekendSalary;
        } else {
            salary = weekdaySalary;
        }
        const priceDeductions = await Promise.all(
            deductionDescription.map(async (item, index) => {
                if (item.deductionId == 0) {
                    let titleDeduction = await prisma.deductionType.findUnique({
                        where: {id: item.deductionTypeId},
                        select: {
                            title: true,
                            price: true
                        }
                    })
                    if (titleDeduction?.title == "Mô tả") {
                        await sendEmail(
                            "hale071204@gmail.com",
                            "Ca làm cần chú ý lỗi",
                            `
                                <h1>Tên: ${existAccount.name}</h1>
                                <h1>Username: ${existAccount.userName}</h1>
                                <h1>Ca làm ngày: ${date}\n</h1>
                                <h1>Thời gian: ${startTime} - ${endTime}\n</h1>
                                <h1>Nội dung: ${item.detail}</h1>
                            `
                        )
                        return 0;
                    } else if (titleDeduction?.title == "Số tiền") {
                        return parseInt(item.quantity);
                    } else if (titleDeduction?.title == "Số phút") {
                        if (parseInt(item.quantity) < 30) {
                            return parseInt(item.quantity) * 4000;
                        } else {
                            return Math.round((100000 / 30 * parseInt(item.quantity)) * 10) / 10;
                        }
                    } else if (titleDeduction?.title == "Số lượng") {
                        return (titleDeduction.price || 1) * parseInt(item.quantity);
                    }
                } else {
                    const priceDeduction = await prisma.deduction.findUnique({
                        where: {id: item.deductionId},
                        select: {
                            price: true
                        }
                    })
                    return (priceDeduction?.price || 1) * parseInt(item.quantity);
                }
            })
        )
        const result = await prisma.$transaction(async (tx) => {
            const updateWork = await tx.work.update({
                where: {id: workId},
                data: {
                    date: date,
                    startTime: startTime,
                    endTime: endTime,
                    salary: salary,
                    isMopping: isMopping,
                    accountId: accountId,
                    status: 1
                }
            })

            const deleteSalaryDeduction = await tx.salaryDeduction.deleteMany({
                where: {workId: workId}
            })

            const addSalaryDeduction = await tx.salaryDeduction.createMany({
                data: deductionDescription.map((item, index) => ({
                    workId: workId,
                    deductionTypeId: item.deductionTypeId,
                    deductionId: item.deductionId == 0 ? null : item.deductionId,
                    quantity: item.quantity,
                    detail: item.detail,
                    cost: priceDeductions[index]
                }))
            })
            return updateWork;
        });

        if (!result) {
            return({
                message: "Cập nhật ca làm thất bại",
                data: false,
                code: 1
            })
        }
        
        return({
            message: "Cập nhật ca làm thành công",
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

const findWorkService = async (findValue: string, accountId: number, month: number, year: number): Promise<ReturnData> => {
    try {
        const from = `01/${(month + 1).toString().padStart(2, "0")}/${year}`;
        const to   = `01/${(month + 2).toString().padStart(2, "0")}/${year}`;

        // const result = await prisma.$queryRaw`
        //     SELECT *
        //     FROM "Work"
        //     WHERE to_date("date", 'DD/MM/YYYY') >= to_date(${from}, 'DD/MM/YYYY')
        //     AND to_date("date", 'DD/MM/YYYY') <  to_date(${to}, 'DD/MM/YYYY')
        //     AND "accountId" = ${accountId}
        //     AND "status" = 1;
        // `;

        const workList = await prisma.work.findMany({
            where: {
                AND: [
                    {accountId: accountId},
                    {status: 1},
                    {date: {
                        contains: `${month + 1 < 10 ? `/0${month + 1}/${year}` : `/${month + 1}/${year}`}`
                    }}
                ]
            },
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                salary: true,
                isMopping: true
            }
        })

        let result: any[] = [];
        for (let i = 0; i < workList.length; i++) {
            if (workList[i].date?.includes(findValue) || `${dayjs(workList[i].date, "DD/MM/YYYY").day() == 0 ? "chu nhat" : `thu ${dayjs(workList[i].date, "DD/MM/YYYY").day() + 1}`}`.includes(findValue)) {
                result.push(workList[i]);
            }
        }
        
        return({
            message: "Lấy dữ liệu thành công",
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

const getSalaryDeductionService = async (workIdList: number[]): Promise<ReturnData> => {
    try {
        const result = await Promise.all(
            workIdList.map(async (item) => {
                return await prisma.salaryDeduction.findMany({
                    where: {workId: item},
                    include: {
                        work: {
                            select: {
                                date: true
                            }
                        }
                    }
                })
            })
        )
        if (result.length == 0) {
            return ({
                message: "Không có dữ liệu",
                data: false,
                code: 1
            })
        }
        const salaryDeductions: DataSalaryDeduction[] = [];
        result.map((itemParent) => {
            itemParent.map((itemChild) => {
                // id: number,
                // date: string,
                // detail: string,
                // quantity: string,
                // cost: number
                const id = itemChild.id;
                const date = itemChild.work?.date || "";
                let detail: string = "";
                let quantity: string = "";
                let cost: string = "";
                if (itemChild.deductionTypeId == 1) {
                    detail = itemChild.quantity || "";
                    quantity = "1";
                    cost = "-";
                } else {
                    if (itemChild.deductionId == null) {
                        detail = itemChild.detail || "";
                        quantity = itemChild.quantity || "";
                        cost = itemChild.cost ? `${itemChild.cost.toLocaleString("en-US")}đ` : "";
                    }
                    if (itemChild.deductionTypeId == 6 && itemChild.deductionId != null) {
                        detail = itemChild.detail ? `Bể ${itemChild.detail.toLowerCase()}` : "";
                        quantity = itemChild.quantity || "";
                        cost = itemChild.cost ? `${itemChild.cost.toLocaleString("en-US")}đ` : "";
                    }
                    if (itemChild.deductionTypeId == 7 && itemChild.deductionId != null) {
                        detail = itemChild.detail || "";
                        quantity = itemChild.quantity || "";
                        cost = itemChild.cost ? `${itemChild.cost.toLocaleString("en-US")}đ` : "";
                    }
                }
                salaryDeductions.push({id: id, date: date, detail: detail, quantity: quantity, cost: cost})
            })
        })
        return({
            message: "Lấy dữ liệu thành công",
            data: salaryDeductions,
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
    getDeductionService, addWorkService, getWorkListService, deleteWorkService,
    getWorkService, updateWorkService, findWorkService, getSalaryDeductionService
}