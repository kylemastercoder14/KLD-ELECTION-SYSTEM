"use client";

import React from "react";
import { Election } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomFormField from "@/components/globals/custom-formfield";
import { FormFieldType } from "@/constants";
import { Form } from "@/components/ui/form";
import { ElectionValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ElectionForm = ({
  initialData,
  loading,
}: {
  initialData: Election | null;
  loading: boolean;
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof ElectionValidators>>({
    resolver: zodResolver(ElectionValidators),
    mode: "onChange",
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      startDate: initialData?.startDate
        ? new Date(initialData.startDate)
        : undefined,
      endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
      positions: initialData?.positions || [],
      type: initialData?.type || "",
    },
  });

  React.useEffect(() => {
    if (initialData && !loading) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        startDate: initialData?.startDate
          ? new Date(initialData.startDate)
          : undefined,
        endDate: initialData?.endDate
          ? new Date(initialData.endDate)
          : undefined,
        positions: initialData.positions || [],
        type: initialData.type || "",
      });
    }
  }, [initialData, loading, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof ElectionValidators>) {
    try {
      let response;
      if (initialData?.id) {
        // If initialData.id exists, it's an update (PUT)
        response = await fetch(`/api/elections/${initialData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      } else {
        // Otherwise, it's a new creation (POST)
        response = await fetch("/api/elections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        toast.error(errorData.message || "An error occurred.");
        return;
      }

      const responseData = await response.json();
      toast.success(responseData.message || "Operation successful!");
      router.push("/admin/elections");
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save election. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-3.5">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            isRequired={true}
            name="title"
            disabled={isSubmitting || loading}
            label="Election Title"
            placeholder="Enter election title"
          />

          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            isRequired={true}
            name="type"
            disabled={isSubmitting || loading}
            label="Election Type"
            placeholder="Enter election type (e.g. Student Council, Faculty Election)"
          />

          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.RICHTEXT}
            isRequired={true}
            name="description"
            label="Election Description"
            placeholder="Enter election description"
            description={`Max Length: ${
              form.watch("description")?.length || 0
            }/1000 characters.`}
          />

          <div className="grid lg:grid-cols-2 grid-cols-1 gap-3.5">
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.DATE_PICKER}
              isRequired={true}
              name="startDate"
              label="Start Date"
              placeholder="Select start date"
              description="I would recommend setting the start date one week before the election."
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.DATE_PICKER}
              isRequired={true}
              name="endDate"
              label="End Date"
              placeholder="Select end date"
            />
          </div>

          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TAGS_INPUT}
            isRequired={true}
            name="positions"
            disabled={isSubmitting || loading}
            label="Election Positions"
            placeholder="Enter election positions (e.g. President, Vice President)"
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="ghost"
              className="w-fit"
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-fit"
              disabled={isSubmitting || loading}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ElectionForm;
