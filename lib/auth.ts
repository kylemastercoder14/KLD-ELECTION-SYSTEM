// auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: "kld.edu.ph", // Restrict to KLD Gmail accounts
        },
      },
    }),
    CredentialsProvider({
      id: "student-number",
      name: "Student Number",
      credentials: {
        studentNumber: {
          label: "Student Number",
          type: "text",
          placeholder: "Enter your student number",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        console.log("Credentials Provider: authorize function called.");
        if (!credentials?.studentNumber || !credentials?.password) {
          console.log(
            "Credentials Provider: Missing student number or password."
          );
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { studentNumber: credentials.studentNumber },
            include: { candidate: true },
          });

          if (!user) {
            console.log(
              `Credentials Provider: User with student number ${credentials.studentNumber} not found.`
            );
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password || ""
          );

          if (!isValidPassword) {
            console.log(
              `Credentials Provider: Invalid password for user ${credentials.studentNumber}.`
            );
            return null;
          }

          console.log(
            `Credentials Provider: Successfully authorized user ${user.id} (${user.email}).`
          );
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            studentNumber: user.studentNumber,
            isCandidate: !!user.candidate,
          };
        } catch (error) {
          console.error(
            "Credentials Provider: Error during authorization:",
            error
          );
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("JWT Callback: Called.", { user, account });
      if (user) {
        try {
          let dbUser;

          if (account?.provider === "google") {
            console.log("JWT Callback: Google OAuth flow detected.");
            dbUser = await prisma.user.findUnique({
              where: { email: user.email! },
              include: { candidate: true },
            });

            if (!dbUser) {
              console.log(
                "JWT Callback: User not found in DB for Google account. Attempting to create new user:",
                user.email
              );
              try {
                dbUser = await prisma.user.create({
                  data: {
                    email: user.email!,
                    name: user.name || "Unknown User",
                    image: user.image,
                    role: "VOTER",
                    isActive: true,
                  },
                  include: { candidate: true },
                });
                console.log(
                  "JWT Callback: Successfully created new user from Google:",
                  dbUser.id
                );
              } catch (createError) {
                console.error(
                  "JWT Callback: Error creating new user from Google:",
                  createError
                );
                throw createError;
              }
            } else {
              console.log(
                "JWT Callback: Existing user found for Google account:",
                dbUser.id
              );
            }
          } else if (account?.provider === "student-number") {
            console.log("JWT Callback: Student Number provider detected.");
            dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              include: { candidate: true },
            });
            if (!dbUser) {
              console.log(
                `JWT Callback: DB user not found for student-number provider with ID: ${user.id}. Populating token with user data.`
              );
              token.id = user.id;
              token.role = (user as any).role || "VOTER";
              token.isCandidate = (user as any).isCandidate || false;
              token.studentNumber = (user as any).studentNumber || null;
              return token;
            } else {
              console.log(
                `JWT Callback: Existing user found for student-number provider: ${dbUser.id}.`
              );
            }
          }

          if (dbUser) {
            console.log(
              "JWT Callback: Populating token with database user data."
            );
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.isCandidate = !!dbUser.candidate;
            token.studentNumber = dbUser.studentNumber || null;
          } else {
            console.log(
              "JWT Callback: dbUser is null. Populating token with initial user data."
            );
            token.id = user.id;
            token.role = (user as any).role || "VOTER";
            token.isCandidate = (user as any).isCandidate || false;
            token.studentNumber = (user as any).studentNumber || null;
          }
        } catch (error) {
          console.error(
            "JWT Callback: Top-level error during user processing:",
            error
          );
          token.id = user.id;
          token.role = (user as any).role || "VOTER";
          token.isCandidate = (user as any).isCandidate || false;
          token.studentNumber = (user as any).studentNumber || null;
        }
      } else {
        console.log("JWT Callback: No user object, returning existing token.");
      }
      return token;
    },
    async session({ session, token, user }) {
      console.log("Session Callback: Called.", { session, token, user });
      if (user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { candidate: true },
          });

          if (dbUser) {
            console.log(
              "Session Callback: Populating session with database user data."
            );
            session.user.id = dbUser.id;
            session.user.role = dbUser.role;
            session.user.isCandidate = !!dbUser.candidate;
            session.user.studentNumber = dbUser.studentNumber || null;
          } else {
            console.log(
              "Session Callback: DB user not found, populating session with token data."
            );
            session.user.id = token.id as string;
            session.user.role = token.role as
              | "ADMIN"
              | "ELECTION_OFFICER"
              | "CANDIDATE"
              | "VOTER";
            session.user.isCandidate = token.isCandidate as boolean;
            session.user.studentNumber = token.studentNumber as string | null;
          }
        } catch (error) {
          console.error(
            "Session Callback: Error fetching user from DB for session:",
            error
          );
          session.user.id = token.id as string;
          session.user.role = token.role as
            | "ADMIN"
            | "ELECTION_OFFICER"
            | "CANDIDATE"
            | "VOTER";
          session.user.isCandidate = token.isCandidate as boolean;
          session.user.studentNumber = token.studentNumber as string | null;
        }
      } else if (token) {
        console.log(
          "Session Callback: No user object, populating session with token data."
        );
        session.user.id = token.id as string;
        session.user.role = token.role as
          | "ADMIN"
          | "ELECTION_OFFICER"
          | "CANDIDATE"
          | "VOTER";
        session.user.isCandidate = token.isCandidate as boolean;
        session.user.studentNumber = token.studentNumber as string | null;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("SignIn Callback: Called.", { user, account, profile });
      if (
        account?.provider === "google" &&
        profile?.email?.endsWith("@kld.edu.ph")
      ) {
        console.log(
          "SignIn Callback: Google sign-in for kld.edu.ph domain. Returning true."
        );
        return true;
      } else if (
        account?.provider === "google" &&
        !profile?.email?.endsWith("@kld.edu.ph")
      ) {
        console.log(
          `SignIn Callback: Google sign-in for unauthorized domain: ${profile?.email}. Returning false.`
        );
        return false; // Prevent sign-in for non-KLD emails
      } else if (account?.provider === "student-number") {
        console.log("SignIn Callback: Student Number sign-in. Returning true.");
        return true;
      }

      console.log(
        "SignIn Callback: No matching provider or condition. Returning false."
      );
      return false;
    },
    // *** ADD OR UPDATE THIS REDIRECT CALLBACK ***
    async redirect({ url, baseUrl }) {
      console.log("Redirect Callback: Called.", { url, baseUrl });

      // If the `url` is the sign-in page, it means the initial `callbackUrl` wasn't set,
      // or was overridden. In this case, redirect to the default voter page.
      if (url === `${baseUrl}/auth/signin`) {
        console.log(
          "Redirect Callback: Initial URL was sign-in page. Defaulting to /voter."
        );
        return `${baseUrl}/voter`;
      }

      // If the URL starts with the baseUrl, it's an internal URL (e.g., /voter, /admin)
      // and we should redirect to it. This handles the explicit callbackUrl from signIn().
      if (url.startsWith(baseUrl)) {
        console.log(
          `Redirect Callback: Redirecting to specified internal URL: ${url}`
        );
        return url;
      }

      // Fallback for any other unexpected URLs, redirect to default voter page
      console.log(
        `Redirect Callback: Unexpected URL (${url}). Defaulting to /voter.`
      );
      return `${baseUrl}/voter`;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "database",
  },
  events: {
    async signIn(message) {
      console.log("NextAuth Event: SignIn", message);
    },
    async signOut(message) {
      console.log("NextAuth Event: SignOut", message);
    },
    async createUser(message) {
      console.log("NextAuth Event: CreateUser", message);
    },
    async linkAccount(message) {
      console.log("NextAuth Event: LinkAccount", message);
    },
    async session(message) {
      console.log("NextAuth Event: Session", message);
    },
  },
};
