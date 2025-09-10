import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PartylistValidators } from "@/validators";

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
        { error: "Partylist ID is required" },
        { status: 400 }
      );
    }

    const partylist = await prisma.party.findUnique({
      where: {
        id: id,
      },
      include: {
        candidates: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(partylist, { status: 200 });
  } catch (error) {
    console.error("Error fetching partylist:", error);
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
    const validatedData = PartylistValidators.safeParse(body);

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

    const { name, description, logo } = validatedData.data;
    const updatedPartylist = await prisma.party.update({
      where: { id: id },
      data: {
        name,
        description,
        logoUrl: logo,
      },
    });

    if (!updatedPartylist) {
      return NextResponse.json(
        { message: "Partylist not found" },
        { status: 404 }
      );
    }

    await prisma.systemLog.create({
      data: {
        action: "UPDATE_PARTYLIST",
        userId: session.user.id,
        details: `Updated party list ${updatedPartylist.id} on ${new Date()}`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Partylist updated successfully",
        partylist: updatedPartylist,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error updating partylist`, error);
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { message: "Partylist not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
