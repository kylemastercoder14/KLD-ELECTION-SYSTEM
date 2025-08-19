"use client";

import React from "react";
import Heading from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Election } from "@prisma/client";
import { DataTable } from "@/components/globals/data-table";
import { columns } from "./_components/columns";

const Page = () => {
  const router = useRouter();
  const [elections, setElections] = React.useState<Election[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/elections");
      if (!response.ok) {
        throw new Error("Failed to fetch elections");
      }
      const data = await response.json();
      setElections(data);
    } catch (error) {
      console.error("Error fetching elections:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchElections();
  }, []);
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Manage Elections"
          description="Overview of all elections. You can create, edit, delete and change the status of elections."
        />
        <Button onClick={() => router.push("/admin/elections/create")} size="sm">
          <Plus className="size-4" />
          Create new election
        </Button>
      </div>
      <div className="mt-5">
        <DataTable columns={columns} data={elections} />
      </div>
    </div>
  );
};

export default Page;
