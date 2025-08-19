"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import { PartyWithCandidates } from "@/types/types";
import {
  ArrowLeft,
  Users,
  Calendar,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials, getStatusColor } from "@/lib/utils";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const partylistId = params.id;
  const [initialData, setInitialData] =
    React.useState<PartyWithCandidates | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [expandedPlatforms, setExpandedPlatforms] = React.useState<
    Record<string, boolean>
  >({});

  const togglePlatformExpansion = (candidateId: string) => {
    setExpandedPlatforms((prev) => ({
      ...prev,
      [candidateId]: !prev[candidateId],
    }));
  };

  const shouldShowViewMore = (text: string) => {
    // Check if text is longer than approximately 3 lines (roughly 150 characters)
    return text.length > 150;
  };

  const fetchPartyList = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/party-lists/${partylistId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch party list");
      }
      const data = await response.json();
      setInitialData(data);
    } catch (error) {
      console.error("Error fetching party list:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPartyList();
  }, [partylistId]);

  if (loading) {
    return (
      <div className="flex items-center fixed inset-0 w-full z-50 justify-center h-screen bg-white">
        <Loader2 className="animate-spin size-12 text-primary" />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="p-6">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Party Not Found
            </h1>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                The party list you're looking for could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Party Details</h1>
        </div>

        <div className="grid lg:grid-cols-5 grid-cols-1 gap-5">
          <div className="lg:col-span-3">
            {/* Party Information Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start gap-6">
                  {/* Party Logo */}
                  <div className="flex-shrink-0">
                    {initialData.logoUrl ? (
                      <img
                        src={initialData.logoUrl}
                        alt={`${initialData.name} logo`}
                        className="h-24 w-24 rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        {getInitials(initialData.name)}
                      </div>
                    )}
                  </div>

                  {/* Party Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {initialData.name}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {initialData.candidates?.length || 0} candidates
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Created{" "}
                              {new Date(
                                initialData.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {initialData.description && (
                          <div
                            className="text-gray-700 prose prose-lg space-y-4 leading-relaxed max-w-3xl"
                            dangerouslySetInnerHTML={{
                              __html: initialData.description || "",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
          <div className="lg:col-span-2">
            {/* Candidates Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Candidates ({initialData.candidates?.length || 0})
                </CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[calc(100vh-250px)] p-0">
                {!initialData.candidates ||
                initialData.candidates.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      No candidates registered for this party yet.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 p-6">
                    {initialData.candidates.map((candidate) => (
                      <Card key={candidate.id} className="border-none">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={candidate.imageUrl || ""}
                                alt={candidate.user?.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                                {getInitials(candidate.user?.name || "Unknown")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {candidate.user?.name || "Unknown Candidate"}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {candidate.position}
                              </p>
                            </div>
                            <Badge
                              className={`text-xs uppercase ${getStatusColor(
                                candidate.status
                              )}`}
                              variant="outline"
                            >
                              {candidate.status.toLowerCase()}
                            </Badge>
                          </div>

                          {candidate.platform && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 font-medium mb-1">
                                Platform:
                              </p>
                              <div
                                className={`text-sm text-gray-700 leading-relaxed transition-all duration-200 ${
                                  expandedPlatforms[candidate.id]
                                    ? ""
                                    : "line-clamp-3"
                                }`}
                                dangerouslySetInnerHTML={{
                                  __html: candidate.platform || "",
                                }}
                              />
                              {shouldShowViewMore(candidate.platform) && (
                                <button
                                  className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium underline cursor-pointer bg-transparent border-none"
                                  onClick={() =>
                                    togglePlatformExpansion(candidate.id)
                                  }
                                >
                                  {expandedPlatforms[candidate.id]
                                    ? "View Less"
                                    : "View More"}
                                </button>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Registered{" "}
                                  {new Date(
                                    candidate.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                router.push(
                                  `/admin/candidates/${candidate.id}/view-profile`
                                )
                              }
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
