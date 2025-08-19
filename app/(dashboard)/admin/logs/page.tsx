"use client";

import { useRouter } from "next/navigation";
import React from "react";
import Heading from "@/components/ui/heading";
import { Loader2, Plus } from "lucide-react";
import { DataTable } from "@/components/globals/data-table";
import { columns } from "./_components/columns";
import { SystemLogWithUser } from '@/types/types';

const Page = () => {
  const router = useRouter();
  const [logs, setLogs] = React.useState<SystemLogWithUser[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchLogs = async () => {
	try {
	  setLoading(true);
	  const response = await fetch("/api/system-logs");
	  if (!response.ok) {
		throw new Error("Failed to fetch system logs");
	  }
	  const data = await response.json();
	  setLogs(data);
	} catch (error) {
	  console.error("Error fetching system logs:", error);
	} finally {
	  setLoading(false);
	}
  };

  React.useEffect(() => {
	fetchLogs();
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
		  title="Manage System Logs"
		  description="Overview of all system logs. You can view and manage the logs."
		/>
	  </div>
	  <div className="mt-5">
		<DataTable columns={columns} data={logs} />
	  </div>
	</div>
  );
};

export default Page;
