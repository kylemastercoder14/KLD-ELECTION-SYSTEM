"use client";

import React from "react";
import Heading from "@/components/ui/heading";
import { useParams } from "next/navigation";
import { Election } from "@prisma/client";
import ElectionForm from "@/components/forms/election-form";

const Page = () => {
  const params = useParams();
  const electionId = params.id;
  const [initialData, setInitialData] = React.useState<Election | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchElection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/elections/${electionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch election");
      }
      const data = await response.json();
      setInitialData(data);
    } catch (error) {
      console.error("Error fetching election:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchElection();
  }, [electionId]);

  const title = initialData ? `Edit Election: ${initialData.title}` : "Create new election";
  const description = initialData
    ? "Update the details of the election."
    : "Fill all the required fields to create a new election.";
  return (
    <div className="p-6">
      <Heading
        title={title}
        description={description}
      />
      <div className="mt-5">
        <ElectionForm initialData={initialData} loading={loading} />
      </div>
    </div>
  );
};

export default Page;
