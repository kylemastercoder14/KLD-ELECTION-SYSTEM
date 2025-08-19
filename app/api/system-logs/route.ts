import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const systemLogs = await prisma.systemLog.findMany({
      include: {
        user: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    return NextResponse.json(systemLogs, { status: 200 });
  } catch (error) {
    console.error("Error fetching system logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
