import React from "react";
import Client from "./_components/client";
import prisma from "@/lib/prisma";

const Page = async ({
  params,
}: {
  params: Promise<{ electionId: string }>;
}) => {
  const { electionId } = await params;
  const election = await prisma.election.findUnique({
    where: {
      id: electionId,
    },
  });
  const candidates = await prisma.candidate.findMany({
    where: {
      electionId: electionId,
	  status: "APPROVED"
    },
    include: {
      party: true,
      user: true,
    },
    orderBy: [{ position: "asc" }, { user: { name: "asc" } }],
  });
  return (
    <div className="p-6">
      <Client election={election} candidates={candidates} />
    </div>
  );
};

export default Page;
