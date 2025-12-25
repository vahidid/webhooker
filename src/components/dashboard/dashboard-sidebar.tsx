"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  House,
  Plugs,
  PaperPlaneTilt,
  GitBranch,
  ClockCounterClockwise,
  GearSix,
  User,
  SignOut,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

import { signOutUser } from "@/lib/actions/auth";
import { OrganizationSwitcher } from "@/components/organization/organization-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import LogoImage from '@/assets/images/logo.png';

interface Organization {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  logo: string | null;
}

interface DashboardSidebarProps {
  organizations: Organization[];
  currentOrganization: Organization | null;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: House, exact: true },
  { href: "/dashboard/endpoints", label: "Endpoints", icon: Plugs },
  { href: "/dashboard/channels", label: "Channels", icon: PaperPlaneTilt },
  { href: "/dashboard/routes", label: "Routes", icon: GitBranch },
  { href: "/dashboard/events", label: "Events", icon: ClockCounterClockwise },
  { href: "/dashboard/settings", label: "Settings", icon: GearSix },
];

export function DashboardSidebar({
  organizations,
  currentOrganization,
  user,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-20 items-center justify-center gap-2 border-b border-border px-4">
        <Image src={LogoImage} alt="Webhooker Logo" height={160} />
      </div>

      {/* Organization Switcher */}
      <div className="border-b border-border p-4">
        <OrganizationSwitcher
          organizations={organizations}
          currentOrganization={currentOrganization}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-5" weight={isActive ? "fill" : "regular"} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="border-t border-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium overflow-hidden">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    width={32}
                    height={32}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <div className="flex flex-col items-start truncate">
                <span className="truncate text-sm font-medium">{user.name || "User"}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings/profile" className="cursor-pointer gap-2">
                <User className="size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer gap-2">
                <GearSix className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOutUser()}
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            >
              <SignOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
