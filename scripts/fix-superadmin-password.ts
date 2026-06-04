import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  // Update the super admin password
  const user = await prisma.user.update({
    where: { email: "superadmin@sckoolsuite.com" },
    data: { password: hashedPassword },
  });

  console.log("Super Admin password updated:");
  console.log(`Email: ${user.email}`);
  console.log(`Password: password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
