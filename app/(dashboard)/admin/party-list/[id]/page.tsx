"use client";

import React from "react";
import Heading from "@/components/ui/heading";
import { useParams } from "next/navigation";
import PartylistForm from "@/components/forms/party-list-form";
import { PartyWithCandidates } from "@/types/types";
import { Loader2 } from "lucide-react";

const Page = () => {
  const params = useParams();
  const partylistId = params.id;
  const [initialData, setInitialData] =
    React.useState<PartyWithCandidates | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchPartyList = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/party-lists/${partylistId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch party list");
      }
      const data = await response.json();
      setInitialData(data);
    } catch (error) {
      console.error("Error fetching party list:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPartyList();
  }, [partylistId]);

  const title = initialData
    ? `Edit Party List: ${initialData.name}`
    : "Create new party list";
  const description = initialData
    ? "Update the details of the party list."
    : "Fill all the required fields to create a new party list.";

  if (loading) {
    return (
      <div className="flex items-center fixed inset-0 w-full z-50 justify-center h-screen bg-white">
        <Loader2 className="animate-spin size-12 text-primary" />
      </div>
    );
  }
  return (
    <div className="p-6">
      <Heading title={title} description={description} />
      <div className="mt-5">
        <PartylistForm initialData={initialData} loading={loading} />
      </div>
    </div>
  );
};

export default Page;
