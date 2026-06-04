import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create Super Admin role if not exists
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { name: "SUPER_ADMIN" },
  });

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create Super Admin user
  const user = await prisma.user.upsert({
    where: { email: "superadmin@sckoolsuite.com" },
    update: {},
    create: {
      email: "superadmin@sckoolsuite.com",
      name: "Super Administrator",
      password: hashedPassword,
      roleId: superAdminRole.id,
      isActive: true,
    },
  });

  console.log("Super Admin created:");
  console.log(`Email: ${user.email}`);
  console.log(`Password: password123`);
  console.log(`Role: SUPER_ADMIN`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
