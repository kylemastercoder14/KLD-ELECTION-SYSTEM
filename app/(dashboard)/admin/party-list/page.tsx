"use client";

import { useRouter } from "next/navigation";
import React from "react";
import Heading from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { DataTable } from "@/components/globals/data-table";
import { PartyWithCandidates } from "@/types/types";
import { columns } from "./_components/columns";

const Page = () => {
  const router = useRouter();
  const [partylists, setPartylists] = React.useState<PartyWithCandidates[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchPartylists = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/party-lists");
      if (!response.ok) {
        throw new Error("Failed to fetch party lists");
      }
      const data = await response.json();
      setPartylists(data);
    } catch (error) {
      console.error("Error fetching party lists:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPartylists();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center fixed inset-0 w-full z-50 justify-center h-screen bg-white">
        <Loader2 className="animate-spin size-12 text-primary" />
      </div>
    );
  }
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Manage Partylist"
          description="Overview of all party lists. You can create, edit and delete the party lists."
        />
        <Button
          onClick={() => router.push("/admin/party-list/create")}
          size="sm"
        >
          <Plus className="size-4" />
          Create new party list
        </Button>
      </div>
      <div className="mt-5">
        <DataTable columns={columns} data={partylists} />
      </div>
    </div>
  );
};

export default Page;
