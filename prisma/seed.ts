import { PrismaClient } from '@prisma/client';
import { genSalt, hash } from 'bcrypt-ts';

//Dưới 30p: 4k/phút
//30p: 100k
//1h: 200k

const prisma = new PrismaClient();
const name = [
    "Hà", "Góc", "Thúy", "Thu", "Minh", "Thương", "Thảo",
    "Đoan", "Khôi", "Luận", "Huy", "Duy", "Hào"
];
const gender = ["Nữ", "Nam"];
const userName = [
    "ha50927", "goc78878", "thuy18614", "thu69448", "minh48560", "thuong81266", "thao44532",
    "doan26516", "khoi89128", "luan72436", "huy74802", "duy19756", "hao51603"
]
const email = [
    "ha50927@admin.goc.com", "goc78878@admin.goc.com", "thuy18614@employee.goc.com",
    "thu69448@employee.goc.com", "minh48560@employee.goc.com", "thuong81266@employee.goc.com",
    "thao44532@employee.goc.com", "doan26516@employee.goc.com", "khoi89128@employee.goc.com",
    "luan72436@employee.goc.com", "huy74802@employee.goc.com", "duy19756@employee.goc.com",
    "hao51603@employee.goc.com"
]
const salary = [
    null, null, 2, 1, 2, 2, 2,
    4, 4, 3, 3, 3, 3
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
    "/admin/delete-work-error"
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
    1
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
        const thuys = await prisma.account.upsert({
            where: {userName: userName[2]},
            update: {},
            create: {
                name: name[2],
                gender: gender[0],
                email: email[2],
                userName: userName[2],
                password: await createPassword(),
                roleId: 2,
                status: 1,
                salaryId: salary[2]
            }
        });
        const thu = await prisma.account.upsert({
            where: {userName: userName[3]},
            update: {},
            create: {
                name: name[3],
                gender: gender[0],
                email: email[3],
                userName: userName[3],
                password: await createPassword(),
                roleId: 2,
                status: 1,
                salaryId: salary[3]
            }
        });
        const minh = await prisma.account.upsert({
            where: {userName: userName[4]},
            update: {},
            create: {
                name: name[4],
                gender: gender[0],
                email: email[4],
                userName: userName[4],
                password: await createPassword(),
                roleId: 2,
                status: 1,
                salaryId: salary[4]
            }
        });
        const thuongw = await prisma.account.upsert({
            where: {userName: userName[5]},
            update: {},
            create: {
                name: name[5],
                gender: gender[0],
                email: email[5],
                userName: userName[5],
                password: await createPassword(),
                roleId: 2,
                status: 1,
                salaryId: salary[5]
            }
        });
        const thaor = await prisma.account.upsert({
            where: {userName: userName[6]},
            update: {},
            create: {
                name: name[6],
                gender: gender[0],
                email: email[6],
                userName: userName[6],
                password: await createPassword(),
                roleId: 2,
                status: 1,
                salaryId: salary[6]
            }
        });
        const doand = await prisma.account.upsert({
            where: {userName: userName[7]},
            update: {},
            create: {
                name: name[7],
                gender: gender[1],
                email: email[7],
                userName: userName[7],
                password: await createPassword(),
                roleId: 2,
                status: 1,
                salaryId: salary[7]
            }
        });
        const khoio = await prisma.account.upsert({
            where: {userName: userName[8]},
            update: {},
            create: {
                name: name[8],
                gender: gender[1],
                email: email[8],
                userName: userName[8],
                password: await createPassword(),
                roleId: 2,
                status: 1,
                salaryId: salary[8]
            }
        });
        const luanaj = await prisma.account.upsert({
            where: {userName: userName[9]},
            update: {},
            create: {
                name: name[9],
                gender: gender[1],
                email: email[9],
                userName: userName[9],
                password: await createPassword(),
                roleId: 2,
                status: 1,
                salaryId: salary[9]
            }
        });
        const huy = await prisma.account.upsert({
            where: {userName: userName[10]},
            update: {},
            create: {
                name: name[10],
                gender: gender[1],
                email: email[10],
                userName: userName[10],
                password: await createPassword(),
                roleId: 2,
                status: 1,
                salaryId: salary[10]
            }
        });
        const duy = await prisma.account.upsert({
            where: {userName: userName[11]},
            update: {},
            create: {
                name: name[11],
                gender: gender[1],
                email: email[11],
                userName: userName[11],
                password: await createPassword(),
                roleId: 2,
                status: 1,
                salaryId: salary[11]
            }
        });
        const haof = await prisma.account.upsert({
            where: {userName: userName[12]},
            update: {},
            create: {
                name: name[12],
                gender: gender[1],
                email: email[12],
                userName: userName[12],
                password: await createPassword(),
                roleId: 2,
                status: 1,
                salaryId: salary[12]
            }
        });
        
        console.log("Create Data Success");
    } catch(e) {
        console.log(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();