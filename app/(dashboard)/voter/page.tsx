"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vote, Calendar, Users, Trophy } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  positions: string[];
  _count: {
    candidates: number;
    votes: number;
  };
}

export default function VoterDashboard() {
  const { data: session } = useSession();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await fetch("/api/elections");
      const data = await response.json();
      setElections(data);
    } catch (error) {
      console.error("Failed to fetch elections:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "UPCOMING":
        return "bg-blue-500";
      case "COMPLETED":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Elections
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {elections.filter((e) => e.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Elections you can vote in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {elections.reduce((sum, e) => sum + e._count.candidates, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all elections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Votes</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Votes cast this session
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Active Elections</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {elections
              .filter((election) => election.status === "ACTIVE")
              .map((election) => (
                <Card
                  key={election.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {election.title}
                      </CardTitle>
                      <Badge className={getStatusColor(election.status)}>
                        {election.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: election.description,
                        }}
                      />
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(election.startDate).toLocaleDateString()} -{" "}
                          {new Date(election.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{election._count.candidates} candidates</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{election.positions.join(", ")}</span>
                      </div>
                      <div className="pt-2">
                        <Button asChild className="w-full">
                          <Link href={`/voter/elections/${election.id}`}>
                            <Vote className="w-4 h-4 mr-2" />
                            Vote Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Elections</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {elections
              .filter((election) => election.status === "UPCOMING")
              .map((election) => (
                <Card key={election.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {election.title}
                      </CardTitle>
                      <Badge className={getStatusColor(election.status)}>
                        {election.status}
                      </Badge>
                    </div>
                    <CardDescription>{election.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Starts:{" "}
                          {new Date(election.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {election._count.candidates} candidates registered
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
