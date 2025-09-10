import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PartylistValidators } from "@/validators";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partyLists = await prisma.party.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
        candidates: true,
      },
    });

    return NextResponse.json(partyLists, { status: 200 });
  } catch (error) {
    console.error("Error fetching party lists:", error);
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

    // check if the partylist already in the database

    const existingPartylist = await prisma.party.findFirst({
      where: {
        name,
      },
    });

    if (existingPartylist) {
      return NextResponse.json(
        { message: "Party list with this name already exists." },
        { status: 409 }
      );
    }

    const partylist = await prisma.party.create({
      data: {
        name,
        description,
        logoUrl: logo,
      },
    });

    await prisma.systemLog.create({
      data: {
        action: "CREATE_PARTYLIST",
        userId: session.user.id,
        details: `Created party list ${partylist.id} on ${new Date()}`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Party list created successfully", partylist },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating party list:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
