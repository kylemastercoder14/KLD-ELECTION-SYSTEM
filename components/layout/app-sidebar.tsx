"use client";

import { useSession } from "next-auth/react";
import {
  BarChart3,
  Users,
  Vote,
  Settings,
  Calendar,
  UserCheck,
  Trophy,
  Shield,
  Sun,
  Moon,
  Building,
  UserCog,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { usePathname } from 'next/navigation';

const menuItems = {
  ADMIN: [
    { title: "Dashboard", url: "/admin", icon: BarChart3 },
    { title: "Elections", url: "/admin/elections", icon: Calendar },
    { title: "Partylist", url: "/admin/party-list", icon: Building },
    { title: "Candidates", url: "/admin/candidates", icon: UserCheck },
    { title: "Accounts", url: "/admin/accounts", icon: UserCog },
    { title: "Voters", url: "/admin/voters", icon: Users },
    { title: "System Logs", url: "/admin/logs", icon: Shield },
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ],
  ELECTION_OFFICER: [
    { title: "Dashboard", url: "/officer", icon: BarChart3 },
    { title: "Monitor Elections", url: "/officer/elections", icon: Vote },
    { title: "Candidates", url: "/officer/candidates", icon: UserCheck },
    { title: "Results", url: "/officer/results", icon: Trophy },
  ],
  CANDIDATE: [
    { title: "Dashboard", url: "/candidate", icon: BarChart3 },
    { title: "My Application", url: "/candidate/application", icon: UserCheck },
    { title: "Campaign", url: "/candidate/campaign", icon: Vote },
    { title: "Results", url: "/candidate/results", icon: Trophy },
  ],
  VOTER: [
    { title: "Dashboard", url: "/voter", icon: BarChart3 },
    { title: "Elections", url: "/voter/elections", icon: Vote },
    { title: "Candidates", url: "/voter/candidates", icon: Users },
    { title: "My Votes", url: "/voter/votes", icon: Trophy },
  ],
};

export function AppSidebar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  if (!session?.user) return null;

  const userMenuItems =
    menuItems[session.user.role as keyof typeof menuItems] || menuItems.VOTER;

  // Function to handle the switch change
  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  // Determine if the switch should be checked (i.e., dark mode is active)
  const isDarkMode = theme === "dark";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative">
            <Image
              src="/kld-logo.webp"
              alt="KLD Logo"
              fill
              className="size-full"
            />
          </div>
          <div>
            <h2 className="font-semibold text-sm">KLD Election</h2>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Use a flex container to align the label, icon, and switch */}
            <div className="flex items-center justify-between w-full py-2 px-3">
              <Label
                htmlFor="theme-switch"
                className="flex items-center gap-2 cursor-pointer"
              >
                {isDarkMode ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
                <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
              </Label>
              <Switch
                id="theme-switch"
                checked={isDarkMode}
                onCheckedChange={handleThemeChange}
                aria-label="Toggle theme"
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
