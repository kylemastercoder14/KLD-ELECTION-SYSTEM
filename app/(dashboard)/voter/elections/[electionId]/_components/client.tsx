"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  User,
  Eye,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Candidate, Election, Party, User as UserType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VoteState {
  [position: string]: string;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CandidatesWithExtendedProps extends Candidate {
  party: Party | null;
  user: UserType | null;
}

const Client = ({
  election,
  candidates,
}: {
  election: Election | null;
  candidates: CandidatesWithExtendedProps[];
}) => {
  const router = useRouter();
  const [votes, setVotes] = useState<VoteState>({});
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidatesWithExtendedProps | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  // Countdown timer effect
  useEffect(() => {
    if (!election?.endDate) return;

    const calculateTimeLeft = (): CountdownTime => {
      const endTime = new Date(election.endDate).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);

    // Set initial countdown
    setCountdown(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [election?.endDate]);

  const handleVote = (candidateId: string, position: string) => {
    setVotes((prev) => ({
      ...prev,
      [position]: candidateId,
    }));
  };

  const handleViewCandidate = (
    candidate: CandidatesWithExtendedProps
  ): void => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const handleSubmitVotes = async (): Promise<void> => {
    if (!election?.id) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/elections/${election.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ votes }),
      });

      if (response.ok) {
        alert("Votes submitted successfully!");
        router.push("/voting/success");
      } else {
        const error = await response.json();
        alert(`Error submitting votes: ${error.message}`);
      }
    } catch (error) {
      console.error("Error submitting votes:", error);
      alert("An error occurred while submitting your votes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPositionCandidates = (
    position: string
  ): CandidatesWithExtendedProps[] => {
    return candidates.filter(
      (candidate) => candidate.position.toLowerCase() === position.toLowerCase()
    );
  };

  const isPositionVoted = (position: string): boolean => {
    return votes[position] !== undefined;
  };

  const getTotalVotesNeeded = (): number => {
    return election?.positions.length || 0;
  };

  const getTotalVotesCast = (): number => {
    return Object.keys(votes).length;
  };

  const canSubmitVotes = (): boolean => {
    return (
      getTotalVotesCast() === getTotalVotesNeeded() && getTotalVotesNeeded() > 0
    );
  };

  const formatCountdown = (time: CountdownTime): string => {
    if (time.days > 0) {
      return `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s`;
    } else if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
    } else if (time.minutes > 0) {
      return `${time.minutes}m ${time.seconds}s`;
    } else {
      return `${time.seconds}s`;
    }
  };

  const isElectionEnded = (): boolean => {
    return (
      countdown.days === 0 &&
      countdown.hours === 0 &&
      countdown.minutes === 0 &&
      countdown.seconds === 0
    );
  };

  if (!election) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Election Not Found
          </h2>
          <p className="text-gray-500">
            The requested election could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="dark:bg-zinc-900 bg-white border rounded-2xl shadow mb-8 overflow-hidden">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold mb-2">{election.title}</h1>
          <div
            className="text-muted-foreground text-sm mb-4"
            dangerouslySetInnerHTML={{ __html: election.description || "" }}
          />
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="text-xs">
                {isElectionEnded()
                  ? "Election Ended"
                  : `Time Left: ${formatCountdown(countdown)}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  election.status === "ACTIVE" && !isElectionEnded()
                    ? "bg-primary"
                    : "bg-destructive"
                }`}
              ></div>
              <span className="capitalize text-xs">
                {isElectionEnded() ? "ENDED" : election.status}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 py-4 bg-zinc-100 dark:bg-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Voting Progress: {getTotalVotesCast()} of {getTotalVotesNeeded()}{" "}
              positions
            </span>
            <span className="text-sm">
              {getTotalVotesNeeded() > 0
                ? Math.round(
                    (getTotalVotesCast() / getTotalVotesNeeded()) * 100
                  )
                : 0}
              % complete
            </span>
          </div>
          <div className="w-full bg-zinc-400 dark:bg-zinc-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (getTotalVotesCast() / getTotalVotesNeeded()) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Election Ended Message */}
      {isElectionEnded() && (
        <div className="dark:bg-zinc-900 bg-white border rounded-2xl shadow mb-8 p-6">
          <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-6 h-6" />
            <span className="text-lg font-medium">
              This election has ended. No more votes can be cast.
            </span>
          </div>
        </div>
      )}

      {/* Voting Sections */}
      {election.positions.map((position) => (
        <div key={position} className="mb-8">
          <div className="dark:bg-zinc-900 bg-white border rounded-2xl shadow overflow-hidden">
            <div className="border-b px-8 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold capitalize tracking-wide">
                  {position} (1 Vote)
                </h2>
                {isPositionVoted(position) && (
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Vote Cast</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8">
              {getPositionCandidates(position).length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No approved candidates for this position
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPositionCandidates(position).map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`relative bg-gray-100 dark:bg-zinc-800 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${
                        votes[position] === candidate.id
                          ? "ring-4 ring-secondary"
                          : ""
                      }`}
                    >
                      {/* Selection Indicator */}
                      {votes[position] === candidate.id && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                      )}

                      {/* Candidate Image */}
                      <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
                          {candidate.user && candidate.user.image ? (
                            <img
                              src={candidate.imageUrl || candidate.user.image}
                              alt={candidate.user.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          ) : (
                            <User className="w-10 h-10 text-gray-400 dark:text-gray-300" />
                          )}
                        </div>
                      </div>

                      {/* Candidate Info */}
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-300 mb-1">
                          {candidate.user?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {position}
                        </p>
                        {candidate.party ? (
                          <span className="inline-block bg-secondary text-xs px-2 py-1 rounded-full">
                            {candidate.party.name}
                          </span>
                        ) : (
                          <span className="inline-block bg-secondary text-xs px-2 py-1 rounded-full">
                            Independent
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleVote(candidate.id, position)}
                          className={`flex-1 ${
                            votes[position] === candidate.id
                              ? "bg-emerald-600 text-white shadow-lg"
                              : "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
                          }`}
                        >
                          {votes[position] === candidate.id ? "VOTED" : "VOTE"}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleViewCandidate(candidate)}
                          className=""
                        >
                          <Eye className="w-4 h-4" />
                          VIEW
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Submit Button */}
      <div className="dark:bg-zinc-900 bg-white rounded-2xl shadow border p-8">
        <div className="text-center">
          {!canSubmitVotes() && !isElectionEnded() && (
            <div className="flex items-center justify-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">
                Please cast your vote for all positions before submitting
              </span>
            </div>
          )}
          <Button
            onClick={handleSubmitVotes}
            disabled={!canSubmitVotes() || isSubmitting || isElectionEnded()}
            className={`${
              canSubmitVotes() && !isSubmitting && !isElectionEnded()
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isElectionEnded()
              ? "Election Ended"
              : isSubmitting
              ? "Submitting Votes..."
              : "Submit All Votes"}
          </Button>
        </div>
      </div>

      {/* Candidate Details Modal */}
      {showModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-3xl w-full max-h-[500px] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {selectedCandidate.imageUrl ||
                  selectedCandidate.user?.image ? (
                    <img
                      src={
                        selectedCandidate.imageUrl ||
                        selectedCandidate.user?.image ||
                        ""
                      }
                      alt={selectedCandidate.user?.name || ""}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-zinc-200">
                    {selectedCandidate.user?.name || ""}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedCandidate.position}
                  </p>
                </div>
              </div>
              {selectedCandidate.party && (
                <Badge
                  variant="secondary"
                  className="inline-block mb-4 text-sm"
                >
                  {selectedCandidate.party.name}
                </Badge>
              )}

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-zinc-200 mb-3">
                  Platform & Agenda
                </h4>
                <div
                  className="text-gray-600 dark:text-gray-400 space-y-4 prose prose-lg min-h-none leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: selectedCandidate.platform,
                  }}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button onClick={() => setShowModal(false)}>Close</Button>
                <Button
                  onClick={() => {
                    if (!isElectionEnded()) {
                      handleVote(
                        selectedCandidate.id,
                        selectedCandidate.position
                      );
                    }
                    setShowModal(false);
                  }}
                  disabled={isElectionEnded()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed ${
                    votes[selectedCandidate.position] === selectedCandidate.id
                      ? "bg-emerald-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {isElectionEnded()
                    ? "Election Ended"
                    : votes[selectedCandidate.position] === selectedCandidate.id
                    ? "Voted"
                    : "Vote"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Client;
