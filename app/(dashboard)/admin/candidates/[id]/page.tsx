"use client";

import React from "react";
import Heading from "@/components/ui/heading";
import { useParams } from "next/navigation";
import CandidateForm from "@/components/forms/candidate-form";
import { CandidateWithParty, PartyWithCandidates } from "@/types/types";
import { Election, User } from "@prisma/client";
import { Loader2 } from 'lucide-react';

const Page = () => {
  const params = useParams();
  const candidateId = params.id;
  const [initialData, setInitialData] =
    React.useState<CandidateWithParty | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [partylists, setPartylists] = React.useState<PartyWithCandidates[]>([]);
  const [elections, setElections] = React.useState<Election[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/candidates/${candidateId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch candidate");
      }
      const data = await response.json();
      setInitialData(data);
    } catch (error) {
      console.error("Error fetching candidate:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

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

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/elections?status=UPCOMING");
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
    fetchCandidate();
    fetchUsers();
    fetchPartylists();
    fetchElections();
  }, [candidateId]);

  const title = initialData
    ? `Edit Candidate: ${initialData.user.name}`
    : "Create new Candidate";
  const description = initialData
    ? "Update the details of the candidate."
    : "Fill all the required fields to create a new candidate.";

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
        <CandidateForm
          initialData={initialData}
          loading={loading}
          users={users}
          partylists={partylists}
          elections={elections}
        />
      </div>
    </div>
  );
};

export default Page;
