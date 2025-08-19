import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CandidateValidators } from "@/validators";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidates = await prisma.candidate.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
        party: true,
        user: true,
      },
    });

    return NextResponse.json(candidates, { status: 200 });
  } catch (error) {
    console.error("Error fetching candidates:", error);
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
    const validatedData = CandidateValidators.safeParse(body);

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

    const { electionId, platform, imageUrl, position, userId, partyId } =
      validatedData.data;

    // Check if candidate already exists for this user in this election
    const existingCandidate = await prisma.candidate.findFirst({
      where: {
        userId,
        electionId,
      },
    });

    if (existingCandidate) {
      return NextResponse.json(
        { message: "Candidate already exists for this election." },
        { status: 409 }
      );
    }

    // ✅ New validation: Ensure partylist has only one candidate per position in this election
    const samePositionCandidate = await prisma.candidate.findFirst({
      where: {
        partyId,
        position,
        electionId,
      },
    });

    if (samePositionCandidate) {
      return NextResponse.json(
        {
          message: `This partylist already has a candidate for the ${position} position in this election.`,
        },
        { status: 409 }
      );
    }

    // Create the candidate
    const candidate = await prisma.candidate.create({
      data: {
        electionId,
        platform,
        imageUrl: imageUrl || "",
        position,
        userId,
        partyId: partyId || "",
      },
    });

    await prisma.systemLog.create({
      data: {
        action: "CREATE_CANDIDATE",
        userId: session.user.id,
        details: `Created candidate ${candidate.id} for election ${electionId}`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Candidate created successfully", candidate },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating candidate:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
