import { Account, Salary, Role } from './../src/generated/prisma/index.d';
import { PrismaClient } from "../src/generated/prisma";
import { genSalt, hash } from 'bcrypt-ts';

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
        // const plusTwo = await prisma.salaryPlus.upsert({
        //     where: {name: "2000"},
        //     update: {},
        //     create: {
        //         name: "2000",
        //         plus: 2000
        //     }
        // });
        // const plusThree = await prisma.salaryPlus.upsert({
        //     where: {name: "3000"},
        //     update: {},
        //     create: {
        //         name: "3000",
        //         plus: 3000
        //     }
        // });
        // const plusFour = await prisma.salaryPlus.upsert({
        //     where: {name: "4000"},
        //     update: {},
        //     create: {
        //         name: "4000",
        //         plus: 4000
        //     }
        // });
        // const plusFive = await prisma.salaryPlus.upsert({
        //     where: {name: "5000"},
        //     update: {},
        //     create: {
        //         name: "5000",
        //         plus: 5000
        //     }
        // });
        // const plusSix = await prisma.salaryPlus.upsert({
        //     where: {name: "6000"},
        //     update: {},
        //     create: {
        //         name: "6000",
        //         plus: 6000
        //     }
        // });
        // const plusSeven = await prisma.salaryPlus.upsert({
        //     where: {name: "7000"},
        //     update: {},
        //     create: {
        //         name: "7000",
        //         plus: 7000
        //     }
        // });
        // const plusEight = await prisma.salaryPlus.upsert({
        //     where: {name: "8000"},
        //     update: {},
        //     create: {
        //         name: "8000",
        //         plus: 8000
        //     }
        // });
        // const plusNine = await prisma.salaryPlus.upsert({
        //     where: {name: "9000"},
        //     update: {},
        //     create: {
        //         name: "9000",
        //         plus: 9000
        //     }
        // });
        // const plusTen = await prisma.salaryPlus.upsert({
        //     where: {name: "10000"},
        //     update: {},
        //     create: {
        //         name: "10000",
        //         plus: 10000
        //     }
        // });

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
        const getAccounts = await prisma.permission.upsert({
            where: {url: "/admin/get-account"},
            update: {},
            create: {
                url: "/admin/get-account",
                roleId: 1
            }
        })
        const addAccount = await prisma.permission.upsert({
            where: {url: "/admin/add-account"},
            update: {},
            create: {
                url: "/admin/add-account",
                roleId: 1
            }
        })

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