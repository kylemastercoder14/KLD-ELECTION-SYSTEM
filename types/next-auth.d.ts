// next-auth.d.ts

import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "ELECTION_OFFICER" | "CANDIDATE" | "VOTER";
      isCandidate: boolean;
      // Change to string | null as you're assigning null
      studentNumber: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: "ADMIN" | "ELECTION_OFFICER" | "CANDIDATE" | "VOTER";
    isCandidate?: boolean;
    // Change to string | null
    studentNumber: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: "ADMIN" | "ELECTION_OFFICER" | "CANDIDATE" | "VOTER";
    isCandidate?: boolean;
    // Change to string | null
    studentNumber: string | null;
  }
}
