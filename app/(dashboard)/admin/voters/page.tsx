"use client";

import { useRouter } from "next/navigation";
import React from "react";
import Heading from "@/components/ui/heading";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/globals/data-table";
import { columns } from "./_components/columns";
import { User } from '@prisma/client';

const Page = () => {
  const router = useRouter();
  const [voters, setVoters] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchVoters = async () => {
	try {
	  setLoading(true);
	  const response = await fetch("/api/voters");
	  if (!response.ok) {
		throw new Error("Failed to fetch voters");
	  }
	  const data = await response.json();
	  setVoters(data);
	} catch (error) {
	  console.error("Error fetching voters:", error);
	} finally {
	  setLoading(false);
	}
  };

  React.useEffect(() => {
	fetchVoters();
  }, []);

  if (loading) {
	return (
	  <div className="flex items-center fixed inset-0 w-full z-50 justify-center h-screen bg-white dark:bg-zinc-900">
		<Loader2 className="animate-spin size-12 text-primary" />
	  </div>
	);
  }
  return (
	<div className="p-6">
	  <div className="flex items-center justify-between">
		<Heading
		  title="Manage Voters"
		  description="Overview of all registered voters. You can view and manage the voters."
		/>
	  </div>
	  <div className="mt-5">
		<DataTable columns={columns} data={voters} />
	  </div>
	</div>
  );
};

export default Page;
