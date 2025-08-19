"use client";

import React from "react";
import Heading from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { CandidateWithParty } from "@/types/types";
import { DataTable } from "@/components/globals/data-table";
import { columns } from "./_components/columns";

const Page = () => {
  const router = useRouter();
  const [candidates, setCandidates] = React.useState<CandidateWithParty[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/candidates");
      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCandidates();
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
          title="Manage Candidates"
          description="Overview of all candidates. You can create, edit and delete the candidates."
        />
        <Button
          onClick={() => router.push("/admin/candidates/create")}
          size="sm"
        >
          <Plus className="size-4" />
          Create new candidate
        </Button>
      </div>
      <div className="mt-5">
        <DataTable columns={columns} data={candidates} />
      </div>
    </div>
  );
};

export default Page;
