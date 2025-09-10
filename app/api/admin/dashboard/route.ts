import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalUsers, totalCandidates, activeElections, completedElections] =
      await Promise.all([
        // 1. Count users who are VOTER OR CANDIDATE
        prisma.user.count({
          where: {
            OR: [{ role: "VOTER" }, { role: "CANDIDATE" }],
          },
        }),
        // 2. Count ALL candidates
        prisma.candidate.count(), // Simply count all candidates regardless of status or election
        // 3. Count ACTIVE elections
        prisma.election.count({ where: { status: "ACTIVE" } }),
        // 4. Count COMPLETED elections
        prisma.election.count({ where: { status: "COMPLETED" } }),
      ]);

    return NextResponse.json({
      totalUsers,
      totalCandidates,
      activeElections,
      completedElections,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
