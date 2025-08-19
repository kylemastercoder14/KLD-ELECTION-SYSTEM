import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ElectionStatus } from "@prisma/client";
import { ElectionValidators } from "@/validators";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    const where: { status?: ElectionStatus } = {};

    if (statusParam) {
      const upperCaseStatus = statusParam.toUpperCase();
      if (
        Object.values(ElectionStatus).includes(
          upperCaseStatus as ElectionStatus
        )
      ) {
        where.status = upperCaseStatus as ElectionStatus;
      } else {
        return NextResponse.json(
          {
            error: `Invalid status parameter: ${statusParam}. Valid values are: ${Object.values(
              ElectionStatus
            ).join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    const elections = await prisma.election.findMany({
      where: where,
      orderBy: {
        startDate: "asc",
      },
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
          },
        },
      },
    });

    return NextResponse.json(elections, { status: 200 });
  } catch (error) {
    console.error("Error fetching elections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ElectionValidators.safeParse(body);

    if (!validatedData.success) {
      console.error("Validation error:", validatedData.error.errors);
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, description, startDate, endDate, positions, type } =
      validatedData.data;

    const newElection = await prisma.election.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        positions,
        type,
        status: ElectionStatus.UPCOMING,
        isActive: false,
      },
    });

    await prisma.systemLog.create({
      data: {
        action: "CREATE_ELECTION",
        userId: session.user.id,
        details: `Created new election ${
          newElection.title
        } on ${newElection.startDate.toISOString()}`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Election created successfully", election: newElection },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating election:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
