"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomFormField from "@/components/globals/custom-formfield";
import { FormFieldType } from "@/constants";
import { Form } from "@/components/ui/form";
import { UserValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, UserRole } from "@prisma/client";
import { generatePassword } from "@/lib/utils";
import { createAccount, updateAccount } from "@/actions";

const AccountForm = ({ initialData }: { initialData: User | null }) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof UserValidators>>({
    resolver: zodResolver(UserValidators),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      studentNumber: initialData?.studentNumber || "",
      role: initialData?.role || "VOTER",
      password: generatePassword(),
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        studentNumber: initialData.studentNumber || "",
        role: initialData.role || "VOTER",
      });
    }
  }, [initialData, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof UserValidators>) {
    try {
      let response;
      if (initialData?.id) {
        // If initialData.id exists, it's an update (PUT)
        response = await updateAccount(initialData.id, values);
      } else {
        // Otherwise, it's a new creation (POST)
        response = await createAccount(values);
      }

      if (response.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response.success);
      router.push("/admin/accounts");
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save account. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-3.5">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-3.5">
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              isRequired={true}
              name="name"
              disabled={isSubmitting}
              label="Full Name"
              placeholder="Enter full name"
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              isRequired={true}
              name="studentNumber"
              disabled={isSubmitting}
              label="Student Number"
              placeholder="Enter student number (e.g. KLD-**-******)"
            />
          </div>

          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            isRequired={true}
            name="email"
            disabled={isSubmitting}
            label="Email"
            placeholder="Enter KLD email address"
            description="Make sure to use your official KLD email address. The password will be sent to this email."
          />

          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            dynamicOptions={Object.values(UserRole).map((role) => ({
              value: role,
              label:
                role.charAt(0).toUpperCase() +
                role.slice(1).toLowerCase().replace("_", " "),
            }))}
            isRequired={true}
            name="role"
            disabled={isSubmitting}
            label="Role"
            placeholder="Select role"
          />
          {!initialData && (
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              isRequired={true}
              name="password"
              disabled
              label="Password"
              placeholder="Enter password"
            />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="ghost"
              className="w-fit"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-fit" disabled={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default AccountForm;
