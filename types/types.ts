import {
  Candidate,
  Election,
  Party,
  SystemLog,
  User,
  Vote,
} from "@prisma/client";

interface CandidateWithUser extends Candidate {
  user: User;
}

export interface PartyWithCandidates extends Party {
  candidates: CandidateWithUser[];
}

export interface CandidateWithParty extends Candidate {
  party?: Party;
  user: User;
  election: Election;
  votes: Vote[];
}

export interface SystemLogWithUser extends SystemLog {
  user: User;
}
