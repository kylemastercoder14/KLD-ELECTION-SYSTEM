"use client";

import type React from "react";

import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // Correct for App Router, if using Pages Router it's 'next/router'
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vote, Mail, AlertCircle, User, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [studentCredentials, setStudentCredentials] = useState({
    studentNumber: "",
    password: "",
  });

  // Get the callbackUrl from the URL query parameters. Default to /voter if not present.
  const callbackUrl = searchParams.get("callbackUrl") || "/voter";
  const urlError = searchParams.get("error");

  useEffect(() => {
    checkSession();

    if (urlError) {
      setError(getErrorMessage(urlError));
    }
  }, [urlError]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "AccessDenied":
        return "Access denied. Only KLD Gmail accounts (@kld.edu.ph) are allowed.";
      case "Callback":
        return "There was a problem with the authentication callback.";
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "CredentialsSignin":
        return "Invalid student number or password.";
      default:
        // Your custom error "OAuthCreateAccount" would fall here if it reappears
        return "An error occurred during authentication. Please try again.";
    }
  };

  const checkSession = async () => {
    const session = await getSession();
    if (session) {
      redirectBasedOnRole(session.user.role);
    }
  };

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "ADMIN":
        router.push("/admin");
        break;
      case "ELECTION_OFFICER":
        router.push("/officer");
        break;
      case "CANDIDATE":
        router.push("/candidate");
        break;
      default:
        router.push("/voter");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      // Pass the callbackUrl directly to the signIn function
      const result = await signIn("google", {
        redirect: false, // We'll handle client-side redirect after session check
        callbackUrl: callbackUrl, // <--- ADD THIS LINE
      });

      if (result?.error) {
        setError(getErrorMessage(result.error));
        // If it's an AccessDenied error, redirect to the error page for a clearer message
        if (result.error === "AccessDenied") {
          router.push(`/auth/error?error=${result.error}`);
          return;
        }
      } else if (result?.ok) {
        // Delay slightly to ensure session is fully set
        setTimeout(async () => {
          const session = await getSession(); // Fetch the latest session
          if (session?.user?.role) {
            redirectBasedOnRole(session.user.role);
          } else {
            // Fallback: If no role, still go to voter page
            router.push("/voter");
          }
        }, 1000); // 1-second delay
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!studentCredentials.studentNumber || !studentCredentials.password) {
      setError("Please enter both student number and password.");
      setLoading(false);
      return;
    }

    try {
      // Pass the callbackUrl directly to the signIn function for CredentialsProvider too
      const result = await signIn("student-number", {
        studentNumber: studentCredentials.studentNumber,
        password: studentCredentials.password,
        redirect: false, // We'll handle client-side redirect after session check
        callbackUrl: callbackUrl, // <--- ADD THIS LINE
      });

      if (result?.error) {
        setError(getErrorMessage(result.error));
      } else if (result?.ok) {
        // Delay slightly to ensure session is fully set
        setTimeout(async () => {
          const session = await getSession();
          if (session?.user?.role) {
            redirectBasedOnRole(session.user.role);
          } else {
            router.push("/voter");
          }
        }, 1000); // 1-second delay
      }
    } catch (error) {
      console.error("Student sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-image relative p-4">
      <div className="absolute inset-0 -z-1 bg-custom-gradient"></div>
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 relative flex items-center justify-center mx-auto">
            <Image
              src="/kld-logo.webp"
              alt="KLD Logo"
              fill
              className="size-full"
            />
          </div>
          <CardTitle className="text-2xl">KLD Election System</CardTitle>
          <CardDescription>
            Sign in to participate in student council elections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="google">KLD Gmail</TabsTrigger>
              <TabsTrigger value="student">Student Number</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">
                <p>Sign in with your official KLD Gmail account</p>
              </div>
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? "Signing in..." : "Sign in with KLD Gmail"}
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                <p>Only KLD Gmail accounts (@kld.edu.ph) are allowed</p>
              </div>
            </TabsContent>

            <TabsContent value="student" className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">
                <p>Sign in with your student number and password</p>
              </div>
              <form onSubmit={handleStudentSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentNumber">Student Number</Label>
                  <Input
                    id="studentNumber"
                    type="text"
                    placeholder="Enter your student number"
                    value={studentCredentials.studentNumber}
                    onChange={(e) =>
                      setStudentCredentials({
                        ...studentCredentials,
                        studentNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={studentCredentials.password}
                      onChange={(e) =>
                        setStudentCredentials({
                          ...studentCredentials,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  <User className="w-4 h-4 mr-2" />
                  {loading ? "Signing in..." : "Sign in with Student Number"}
                </Button>
              </form>
              <div className="text-center text-xs text-muted-foreground">
                <p>Don't have an account? Contact your administrator</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
