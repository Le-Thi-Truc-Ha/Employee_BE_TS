import { PrismaClient } from '@prisma/client';
import { genSalt, hash } from 'bcrypt-ts';

//Dưới 30p: 4k/phút
//30p: 100k
//1h: 200k

const prisma = new PrismaClient();
const gender = ["Nữ", "Nam"];

const name = [
    "Hà", "Góc"
];
const nameFemale = [
    "Thúy", "Thu", "Minh", 
    "Thương", "Thảo", "Quyên",
    "Nhung", "Hương",
]
const nameMale = [
    "Khôi", "Luận", "Huy", 
    "Duy", "Hào"
]

const userName = [
    "ha50927", "goc78878"
]
const userNameFemale = [
    "thuy18614", "thu69448", "minh48560", 
    "thuong81266", "thao44532", "quyen90578", 
    "nhung29937","huong84599"
]
const userNameMale = [
    "khoi89128", "luan72436", "huy74802", 
    "duy19756", "hao51603"
]

const email = [
    "ha50927@admin.goc.com", "goc78878@admin.goc.com"
]
const emailFemale = [
    "thuy18614@employee.goc.com", "thu69448@employee.goc.com", "minh48560@employee.goc.com", 
    "thuong81266@employee.goc.com", "thao44532@employee.goc.com", "quyen90578@employee.goc.com", 
    "nhung29937@employee.goc.com", "huong84599@employee.goc.com",
]
const emailMale = [
    "khoi89128@employee.goc.com", "luan72436@employee.goc.com", "huy74802@employee.goc.com", 
    "duy19756@employee.goc.com", "hao51603@employee.goc.com"
]

const salary = [
    null, null
]
const salaryFemale= [
    2, 1, 2, 
    2, 2, 1,
    1, 1
]
const salaryMale = [
    4, 3, 3,
    3, 3
]

const createPassword = async (): Promise<string> => {
    const salt = await genSalt(10);
    const result = await hash("123456789", salt);
    return result;
}

const breakName = [
    "Ly CFS", "Ly CFS phin", "Ly sữa chua", "Ly nước ngọt", "Dĩa", "Ly trà đá nhỏ",
    "Ly trà đá lớn", "Ly trà nóng", "Tách", "Gạc tàn"
];
const breakPrice = [
    10000, 12000, 32000, 10000, 32000, 10000, 10000, 12000, 30000, 30000
];

const drinkName = [
    "Trà đào", "Đá me", "Sâm dứa", "Lipton chanh", "Nước ngọt", "Mì", "Chanh muối",
    "Thuốc", "Bạc xỉu", "Chanh", "Dừa", "CFS", "CFĐ"
];
const drinkPrice = [
    25000, 20000, 20000, 20000, 15000, 15000, 20000, 15000, 15000,
    20000, 20000, 15000, 12000
];

const urlPermission = [
    "/admin/get-account", "/admin/add-account", "/employee/get-deduction",
    "/employee/add-work", "/employee/get-work-list", "/employee/delete-work",
    "/employee/get-work", "/employee/update-work", "/employee/find-work",
    "/employee/get-salary-deduction", "/admin/find-account", "/admin/get-account-information",
    "/admin/update-employee-account", "/admin/reset-employee-password", "/admin/delete-employee",
    "/admin/get-employee-list", "/admin/get-deduction", "/admin/add-work",
    "/admin/get-work-list", "/admin/delete-work", "/admin/get-work",
    "/admin/update-work", "/admin/get-salary-deduction", "/admin/add-keep-salary",
    "/admin/update-salary-deduction", "/admin/add-miss-shift", "/admin/delete-salary-deduction",
    "/admin/pay-keep-salary", "/admin/cancel-pay", "/admin/delete-keep-salary",
    "/admin/get-step-salary", "/admin/update-step-salary", "/admin/get-work-error",
    "/admin/delete-work-error", "/admin/find-work"
]
const rolePermission = [
    1, 1, 2, 
    2, 2, 2, 
    2, 2, 2,
    2, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1
]

const seed = async (): Promise<void> => {
    try {
        // Salary
        const newFemaleSalary = await prisma.salary.upsert({
            where: {name: "Lương nữ mới"},
            update: {},
            create: {
                weekday: 25000,
                weekend: 25000,
                name: "Lương nữ mới"
            }
        });
        const oldFemaleSalary = await prisma.salary.upsert({
            where: {name: "Lương nữ cũ"},
            update: {},
            create: {
                weekday: 26000,
                weekend: 31000,
                name: "Lương nữ cũ"
            }
        });
        const newMaleSalary = await prisma.salary.upsert({
            where: {name: "Lương nam mới"},
            update: {},
            create: {
                weekday: 22000,
                weekend: 22000,
                name: "Lương nam mới"
            }
        });
        const oldMaleSalary = await prisma.salary.upsert({
            where: {name: "Lương nam cũ"},
            update: {},
            create: {
                weekday: 24000,
                weekend: 29000,
                name: "Lương nam cũ"
            }
        });

        // SalaryPlus
        const plusOne = await prisma.salaryPlus.upsert({
            where: {name: "1000"},
            update: {},
            create: {
                name: "1000",
                plus: 1000
            }
        });

        // Role
        const adminRole = await prisma.role.upsert({
            where: {name: "Quản trị hệ thống"},
            update: {},
            create: {
                name: "Quản trị hệ thống"
            }
        });
        const employeeRole = await prisma.role.upsert({
            where: {name: "Nhân viên"},
            update: {},
            create: {
                name: "Nhân viên"
            }
        });

        //Permission
        //Cách 1: Nhanh, không đảm bảo thứ tự
        await Promise.all(
            urlPermission.map(async (item, index) => {
                return prisma.permission.upsert({
                    where: {url: item},
                    update: {},
                    create: {
                        url: item,
                        roleId: rolePermission[index]
                    }
                })
            })
        )
        //Cách 2: Chậm vì chạy tuần tự nên đảm bảo thứ tự
        // for (let i = 0; i < urlPermission.length; i++) {
        //     await prisma.permission.upsert({
        //         where: {url: urlPermission[i]},
        //         update: {},
        //         create: {
        //             url: urlPermission[i],
        //             roleId: rolePermission[i]
        //         }
        //     })
        // }

        //DeductionType
        const deductionType1 = await prisma.deductionType.upsert({
            where: {name: "Khác"},
            update: {},
            create: {
                name: "Khác",
                price: 0,
                title: "Mô tả"
            }
        })
        const deductionType2 = await prisma.deductionType.upsert({
            where: {name: "Ứng lương"},
            update: {},
            create: {
                name: "Ứng lương",
                price: 0,
                title: "Số tiền"
            }
        })
        const deductionType3 = await prisma.deductionType.upsert({
            where: {name: "Đi trễ"},
            update: {},
            create: {
                name: "Đi trễ",
                price: 0,
                title: "Số phút"
            }
        })
        const deductionType4 = await prisma.deductionType.upsert({
            where: {name: "Trễ dưới 10 phút"},
            update: {},
            create: {
                name: "Trễ dưới 10 phút",
                price: 20000
            }
        })
        const deductionType5 = await prisma.deductionType.upsert({
            where: {name: "Trễ dưới 30 phút"},
            update: {},
            create: {
                name: "Trễ dưới 30 phút",
                price: 100000
            }
        })
        const deductionType6 = await prisma.deductionType.upsert({
            where: {name: "Trễ dưới 60 phút"},
            update: {},
            create: {
                name: "Trễ dưới 60 phút",
                price: 200000
            }
        })
        const deductionType7 = await prisma.deductionType.upsert({
            where: {name: "Thiếu tiền"},
            update: {},
            create: {
                name: "Thiếu tiền",
                price: 0,
                title: "Số tiền"
            }
        })
        const deductionType8 = await prisma.deductionType.upsert({
            where: {name: "Nước tràn"},
            update: {},
            create: {
                name: "Nước tràn",
                price: 10000,
                title: "Số lượng"
            }
        })
        const deductionType9 = await prisma.deductionType.upsert({
            where: {name: "Bỏ ca"},
            update: {},
            create: {
                name: "Bỏ ca",
                price: 300000
            }
        })
        const deductionType10 = await prisma.deductionType.upsert({
            where: {name: "Sử dụng điện thoại"},
            update: {},
            create: {
                name: "Sử dụng điện thoại",
                price: 100000
            }
        })
        const deductionType20 = await prisma.deductionType.upsert({
            where: {name: "Bể ly"},
            update: {},
            create: {
                id: 20,
                name: "Bể ly",
                price: 0,
                title: "Số lượng"
            }
        })
        const deductionType21 = await prisma.deductionType.upsert({
            where: {name: "Nước"},
            update: {},
            create: {
                id: 21,
                name: "Nước",
                price: 0,
                title: "Số lượng"
            }
        })
        

        //Deduction
        await Promise.all(
            breakName.map(async (item, index) => {
                return prisma.deduction.upsert({
                    where: {name: breakName[index]},
                    update: {},
                    create: {
                        name: breakName[index],
                        price: breakPrice[index],
                        deductionTypeId: 20
                    }
                })
            })
        )

        await Promise.all(
            drinkName.map(async (item, index) => {
                return prisma.deduction.upsert({
                    where: {name: drinkName[index]},
                    update: {},
                    create: {
                        name: drinkName[index],
                        price: drinkPrice[index],
                        deductionTypeId: 21
                    }
                })
            })
        )

        //Account
        const ha = await prisma.account.upsert({
            where: {userName: userName[0]},
            update: {},
            create: {
                name: name[0],
                gender: gender[0],
                email: email[0],
                userName: userName[0],
                password: await createPassword(),
                roleId: 1,
                status: 1
            }
        });
        const goc = await prisma.account.upsert({
            where: {userName: userName[1]},
            update: {},
            create: {
                name: name[1],
                gender: gender[0],
                email: email[1],
                userName: userName[1],
                password: await createPassword(),
                roleId: 1,
                status: 1
            }
        });
        
        await Promise.all(
            userNameFemale.map(async (item, index) => {
                return await prisma.account.upsert({
                    where: {userName: item},
                    update: {},
                    create: {
                        name: nameFemale[index],
                        gender: gender[0],
                        email: emailFemale[index],
                        userName: item,
                        password: await createPassword(),
                        roleId: 2,
                        status: 1,
                        salaryId: salaryFemale[index]
                    }
                })
            })
        )

        await Promise.all(
            userNameMale.map(async (item, index) => {
                return await prisma.account.upsert({
                    where: {userName: item},
                    update: {},
                    create: {
                        name: nameMale[index],
                        gender: gender[1],
                        email: emailMale[index],
                        userName: item,
                        password: await createPassword(),
                        roleId: 2,
                        status: 1,
                        salaryId: salaryMale[index]
                    }
                })
            })
        )
        console.log("Create Data Success");
    } catch(e) {
        console.log(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();