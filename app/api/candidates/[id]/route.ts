import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CandidateValidators } from "@/validators";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;

    if (!id) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
        party: true,
        election: true,
        votes: true,
      },
    });

    return NextResponse.json(candidate, { status: 200 });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
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
    const updatedCandidate = await prisma.candidate.update({
      where: { id: id },
      data: {
        electionId,
        platform,
        imageUrl,
        position,
        userId,
        partyId: partyId || "",
      },
    });

    if (!updatedCandidate) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 }
      );
    }

    await prisma.systemLog.create({
      data: {
        action: "UPDATE_CANDIDATE",
        userId: session.user.id,
        details: `Updated candidate ${updatedCandidate.id} for election ${updatedCandidate.electionId}`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Candidate updated successfully",
        candidate: updatedCandidate,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error updating candidate`, error);
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
