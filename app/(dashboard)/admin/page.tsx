"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Vote,
  Calendar,
  TrendingUp,
  History,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import {
  ChartConfig,
} from "@/components/ui/chart";
import { ChartAreaDashboard } from '@/components/globals/chart-area-dashboard';

interface DashboardStats {
  totalUsers: number;
  totalCandidates: number;
  activeElections: number;
  completedElections: number;
}

interface RecentLog {
  id: string;
  action: string;
  userId?: string;
  details?: string;
  timestamp: string;
}

interface ElectionOverview {
  id: string;
  title: string;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string;
}

interface MonthlyUserData {
  name: string;
  users: number;
}

const userChartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    completedElections: 0,
    totalCandidates: 0,
    activeElections: 0,
  });
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [activeElectionsList, setActiveElectionsList] = useState<
    ElectionOverview[]
  >([]);
  const [monthlyUsersData, setMonthlyUsersData] = useState<MonthlyUserData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [chartDataLoaded, setChartDataLoaded] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentLogs();
    fetchActiveElectionsList();
    fetchMonthlyUsers();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();
      setStats({
        totalUsers: data.totalUsers,
        totalCandidates: data.totalCandidates,
        activeElections: data.activeElections,
        completedElections: data.completedElections,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      const response = await fetch("/api/admin/logs?limit=5");
      const data = await response.json();
      setRecentLogs(data);
    } catch (error) {
      console.error("Failed to fetch recent logs:", error);
    }
  };

  const fetchActiveElectionsList = async () => {
    try {
      const response = await fetch("/api/elections?status=ACTIVE");
      const data = await response.json();
      setActiveElectionsList(data);
    } catch (error) {
      console.error("Failed to fetch active elections list:", error);
    }
  };

  const fetchMonthlyUsers = async () => {
    try {
      const response = await fetch("/api/admin/users/monthly");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: MonthlyUserData[] = await response.json();
      setMonthlyUsersData(data);
      setChartDataLoaded(true);
    } catch (error) {
      console.error("Failed to fetch monthly user data:", error);
      setMonthlyUsersData([]);
      setChartDataLoaded(true);
    }
  };

  if (session?.user.role !== "ADMIN") {
    return <div>Access denied. Admin privileges required.</div>;
  }

  const displayChartData = monthlyUsersData;

  return (
    <div className="p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered voters and candidates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidates
            </CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">
              Candidates across all elections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Elections
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeElections}</div>
            <p className="text-xs text-muted-foreground">
              Elections currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Elections
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedElections}</div>
            <p className="text-xs text-muted-foreground">
              Elections that have concluded
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent System Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" /> Recent
              System Logs
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/logs">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading logs...</p>
            ) : recentLogs.length > 0 ? (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border-b pb-2 last:border-b-0 last:pb-0"
                  >
                    <p className="text-sm font-medium">{log.action}</p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground">
                        {log.details}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No recent system logs found.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Active Elections Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-muted-foreground" /> Active
              Elections
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/elections">Manage Elections</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading elections...</p>
            ) : activeElectionsList.length > 0 ? (
              <div className="space-y-4">
                {activeElectionsList.map((election) => (
                  <div
                    key={election.id}
                    className="border-b pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-base font-medium">{election.title}</p>
                      <Badge className="capitalize">
                        {election.status.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(election.startDate).toLocaleDateString()} -{" "}
                      {new Date(election.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No active elections found.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Section: Users Monthly Chart - Styled like your example */}
      <ChartAreaDashboard />
    </div>
  );
}
