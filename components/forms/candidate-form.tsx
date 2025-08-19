"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomFormField from "@/components/globals/custom-formfield";
import { FormFieldType } from "@/constants";
import { Form } from "@/components/ui/form";
import { CandidateValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CandidateWithParty, PartyWithCandidates } from "@/types/types";
import { Election, User } from "@prisma/client";

const CandidateForm = ({
  initialData,
  loading,
  users,
  partylists,
  elections,
}: {
  initialData: CandidateWithParty | null;
  loading: boolean;
  users: User[];
  partylists: PartyWithCandidates[];
  elections: Election[];
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof CandidateValidators>>({
    resolver: zodResolver(CandidateValidators),
    mode: "onChange",
    defaultValues: {
      electionId: initialData?.electionId || "",
      imageUrl: initialData?.imageUrl || "",
      partyId: initialData?.partyId || "",
      platform: initialData?.platform || "",
      position: initialData?.position || "",
      userId: initialData?.userId || "",
    },
  });

  React.useEffect(() => {
    if (initialData && !loading) {
      form.reset({
        electionId: initialData.electionId || "",
        imageUrl: initialData.imageUrl || "",
        partyId: initialData.partyId || "",
        platform: initialData.platform || "",
        position: initialData.position || "",
        userId: initialData.userId || "",
      });
    }
  }, [initialData, loading, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof CandidateValidators>) {
    try {
      let response;
      if (initialData?.id) {
        // If initialData.id exists, it's an update (PUT)
        response = await fetch(`/api/candidates/${initialData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      } else {
        // Otherwise, it's a new creation (POST)
        response = await fetch("/api/candidates", {
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
      router.push("/admin/candidates");
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save candidate. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-3.5">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            isRequired={true}
            dynamicOptions={users.map((user) => ({
              value: user.id,
              label: user.name,
              imageUrl: user.image || "",
            }))}
            name="userId"
            disabled={isSubmitting || loading}
            label="Candidate"
            placeholder="Select candidate"
          />

          <div className="grid lg:grid-cols-2 grid-cols-1 gap-3.5">
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.SELECT}
              dynamicOptions={partylists.map((party) => ({
                value: party.id,
                label: party.name,
                imageUrl: party.logoUrl || "",
              }))}
              isRequired={false}
              name="partyId"
              disabled={isSubmitting || loading}
              label="Partylist"
              placeholder="Select partylist"
              description="If no partylist is selected, the candidate will be considered independent."
            />

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              isRequired={true}
              name="position"
              disabled={isSubmitting || loading}
              label="Position"
              placeholder="Enter position (e.g. President)"
            />
          </div>

          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            dynamicOptions={elections.map((election) => ({
              value: election.id,
              label: election.title,
            }))}
            isRequired={true}
            name="electionId"
            disabled={isSubmitting || loading}
            label="Election"
            placeholder="Select election"
          />

          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.RICHTEXT}
            isRequired={true}
            name="platform"
            label="Platform"
            placeholder="Enter platform"
          />

          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.IMAGE_UPLOAD}
            isRequired={false}
            name="imageUrl"
            label="Candidate Photo"
            placeholder="Upload candidate photo"
            maxSize={4}
            imageCount={1}
            description="Make sure the candidate's photo is clear, high-resolution, and properly cropped."
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

export default CandidateForm;
