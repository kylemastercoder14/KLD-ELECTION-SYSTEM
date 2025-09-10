import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ElectionValidators } from "@/validators";

export const dynamic = "force-dynamic";

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
        { error: "Election ID is required" },
        { status: 400 }
      );
    }

    const elections = await prisma.election.findUnique({
      where: {
        id: id,
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

    const updatedElection = await prisma.election.update({
      where: { id: id },
      data: {
        title,
        description,
        startDate,
        endDate,
        positions,
        type,
      },
    });

    if (!updatedElection) {
      return NextResponse.json(
        { message: "Election not found" },
        { status: 404 }
      );
    }

    await prisma.systemLog.create({
      data: {
        action: "UPDATE_ELECTION",
        userId: session.user.id,
        details: `Updated election ${
          updatedElection.title
        } on ${updatedElection.startDate.toISOString()}`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Election updated successfully", election: updatedElection },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error updating election`, error);
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { message: "Election not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
