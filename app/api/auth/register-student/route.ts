import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can register students
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, studentNumber, password, role = "VOTER" } = body;

    // Validate required fields
    if (!email || !name || !studentNumber || !password) {
      return NextResponse.json(
        { error: "Email, name, student number, and password are required" },
        { status: 400 }
      );
    }

    // Validate KLD email
    if (!email.endsWith("@kld.edu.ph")) {
      return NextResponse.json(
        { error: "Only KLD email addresses are allowed" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { studentNumber }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or student number already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        studentNumber,
        password: hashedPassword,
        role,
      },
    });

    await prisma.systemLog.create({
      data: {
        userId: user.id,
        action: "REGISTER",
        details: `User registered with email: ${email}`,
        timestamp: new Date(),
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Student registered successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error registering student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
