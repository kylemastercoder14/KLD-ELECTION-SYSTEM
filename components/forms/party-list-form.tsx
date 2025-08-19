"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomFormField from "@/components/globals/custom-formfield";
import { FormFieldType } from "@/constants";
import { Form } from "@/components/ui/form";
import { PartylistValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PartyWithCandidates } from '@/types/types';

const PartylistForm = ({
  initialData,
  loading,
}: {
  initialData: PartyWithCandidates | null;
  loading: boolean;
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof PartylistValidators>>({
	resolver: zodResolver(PartylistValidators),
	mode: "onChange",
	defaultValues: {
	  name: initialData?.name || "",
	  description: initialData?.description || "",
	  logo: initialData?.logoUrl || "",
	},
  });

  React.useEffect(() => {
	if (initialData && !loading) {
	  form.reset({
		name: initialData.name || "",
		description: initialData.description || "",
		logo: initialData.logoUrl || "",
	  });
	}
  }, [initialData, loading, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof PartylistValidators>) {
	try {
	  let response;
	  if (initialData?.id) {
		// If initialData.id exists, it's an update (PUT)
		response = await fetch(`/api/party-lists/${initialData.id}`, {
		  method: "PUT",
		  headers: {
			"Content-Type": "application/json",
		  },
		  body: JSON.stringify(values),
		});
	  } else {
		// Otherwise, it's a new creation (POST)
		response = await fetch("/api/party-lists", {
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
	  router.push("/admin/party-list");
	} catch (error) {
	  console.error("Form submission failed:", error);
	  toast.error("Failed to save party list. Please try again.");
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
			name="name"
			disabled={isSubmitting || loading}
			label="Party Name"
			placeholder="Enter party name"
		  />

		  <CustomFormField
			control={form.control}
			fieldType={FormFieldType.RICHTEXT}
			isRequired={false}
			name="description"
			label="Party Description"
			placeholder="Enter party description"
			description={`Max Length: ${
			  form.watch("description")?.length || 0
			}/3000 characters.`}
		  />

		  <CustomFormField
			control={form.control}
			fieldType={FormFieldType.IMAGE_UPLOAD}
			isRequired={true}
			name="logo"
			label="Party Logo"
			placeholder="Upload party logo"
			maxSize={4}
			imageCount={1}
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

export default PartylistForm;
