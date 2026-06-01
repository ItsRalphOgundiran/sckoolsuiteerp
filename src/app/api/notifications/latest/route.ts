import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLatestNotifications, type NotificationRole } from "@/lib/notifications";

export async function GET() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || !user.schoolId || !user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await getLatestNotifications({
    schoolId: user.schoolId,
    userId: user.id,
    role: user.role as NotificationRole,
    take: 12,
  });

  return NextResponse.json({ notifications, count: notifications.length });
}
