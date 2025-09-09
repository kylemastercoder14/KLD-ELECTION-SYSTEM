"use server";

import prisma from "@/lib/prisma";
import { UserValidators } from "@/validators";
import z from "zod";
import { sendAccountToEmail } from "@/hooks/use-email-template";

export const archiveAccount = async (id: string, isActive: boolean) => {
  try {
    if (!id) {
      return { error: "Invalid account ID." };
    }

    const response = await prisma.user.update({
      where: { id },
      data: { isActive: !isActive },
    });

    return { success: true, data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update account status. Please try again." };
  }
};

export const createAccount = async (values: z.infer<typeof UserValidators>) => {
  const validatedData = UserValidators.parse(values);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const response = await prisma.user.create({
      data: validatedData,
    });

    await sendAccountToEmail(
      validatedData.email,
      validatedData.name,
      validatedData.password,
      validatedData.studentNumber
    );

    return { success: "Account created successfully.", data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create account. Please try again." };
  }
};

export const updateAccount = async (
  id: string,
  values: z.infer<typeof UserValidators>
) => {
  const validatedData = UserValidators.parse(values);
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser && existingUser.id !== id) {
      return { error: "Another account with this email already exists." };
    }
    const response = await prisma.user.update({
      where: { id },
      data: validatedData,
    });
    return { success: "Account updated successfully.", data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update account. Please try again." };
  }
};
