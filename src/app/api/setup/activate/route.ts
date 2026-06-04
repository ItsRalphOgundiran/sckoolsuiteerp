import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const activateSchema = z.object({
  schoolId: z.string(),
  sessionId: z.string(),
  termId: z.string(),
  adminUser: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

// POST - Activate school and create admin user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = activateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { schoolId, sessionId, termId, adminUser } = parsed.data;

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email: adminUser.email }
    });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin user already exists with this email" },
        { status: 400 }
      );
    }

    // Get or create SCHOOL_ADMIN role
    const adminRole = await prisma.role.upsert({
      where: { name: "SCHOOL_ADMIN" },
      update: {},
      create: { name: "SCHOOL_ADMIN" },
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    const user = await prisma.user.create({
      data: {
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        roleId: adminRole.id,
        schoolId: schoolId,
      },
    });

    // Activate school
    await prisma.school.update({
      where: { id: schoolId },
      data: { isActive: true },
    });

    // Set active session and term settings
    await prisma.schoolSetting.create({
      data: {
        schoolId: schoolId,
        key: "active_session_id",
        value: sessionId,
      },
    });
    await prisma.schoolSetting.create({
      data: {
        schoolId: schoolId,
        key: "active_term_id",
        value: termId,
      },
    });
    await prisma.schoolSetting.create({
      data: {
        schoolId: schoolId,
        key: `user_context_session_${user.id}`,
        value: sessionId,
      },
    });
    await prisma.schoolSetting.create({
      data: {
        schoolId: schoolId,
        key: `user_context_term_${user.id}`,
        value: termId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "School activated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Activation error:", error);
    return NextResponse.json(
      { error: "Failed to activate school" },
      { status: 500 }
    );
  }
}
