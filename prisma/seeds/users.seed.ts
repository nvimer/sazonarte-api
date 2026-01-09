import { PrismaClient, RoleName } from "@prisma/client";
import { logger } from "../../src/config/logger";
import hasherUtils from "../../src/utils/hasher.utils";

const prisma = new PrismaClient();

export const usersData = [
    {
        firstName: "Admin",
        lastName: "User",
        email: "admin@sazonarte.com",
        phone: "3001234567",
        password: "admin123",
        roles: [RoleName.ADMIN],
        profile: {
            address: "Calle 123 #45-67, Ipiales",
        },
    },
    {
        firstName: "Nicolas",
        lastName: "Pantoja",
        email: "mesero@sazonarte.com",
        phone: "3007890123",
        password: "mesero123",
        roles: [RoleName.WAITER],
        profile: {
            address: "Carrera Falsa 2 #09-87, Pasto",
        },
    },
    {
        firstName: "Janneth",
        lastName: "Díaz",
        email: "cajera@sazonarte.com",
        phone: "3008765432",
        password: "cajero123",
        roles: [RoleName.CASHIER],
        profile: {
            address: "Avenida 100 #90-877, Ipiales",
        },
    },
    {
        firstName: "Cesar",
        lastName: "Pantoja",
        email: "cocina@sazonarte.com",
        phone: "3134568765",
        password: "cocina123",
        roles: [RoleName.KITCHEN_MANAGER],
        profile: {
            address: "Barrio Heraldo Romero Mz A Casa 13 , Ipiales",
        },
    },
];

export async function seedUsers() {
    logger.info("🌱 Seeding users...");

    for (const userData of usersData) {
        const hashedPassword = hasherUtils.hash(userData.password);

        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phone: userData.phone,
                password: hashedPassword,
                profile: {
                    create: userData.profile,
                },
            },
        });
        logger.info(` 📝 User "${userData.firstName} ${userData.lastName}" seeded`);

        for (const roleName of userData.roles) {
            const role = await prisma.role.findUnique({
                where: { name: roleName },
            });

            if (role) {
                await prisma.userRole.upsert({
                    where: {
                        roleId_userId: {
                            roleId: role.id,
                            userId: user.id,
                        },
                    },
                    update: {},
                    create: {
                        roleId: role.id,
                        userId: user.id,
                    },
                });
            }
        }
        logger.info(
            `  ✅ Roles assigned to ${userData.firstName} ${userData.lastName}`,
        );
    }

    logger.info(`✅ ${usersData.length} users seeded successfully!`);
}
