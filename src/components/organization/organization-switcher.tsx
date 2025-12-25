"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CaretUpDown,
  Check,
  Plus,
} from "@phosphor-icons/react";

import { setCurrentOrganization } from "@/lib/actions/organization";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateOrganizationModal } from "@/components/organization/create-organization-modal";

interface Organization {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  logo: string | null;
}

interface OrganizationSwitcherProps {
  organizations: Organization[];
  currentOrganization: Organization | null;
}

export function OrganizationSwitcher({
  organizations,
  currentOrganization,
}: OrganizationSwitcherProps) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchOrganization = async (orgId: string) => {
    if (orgId === currentOrganization?.id) return;

    setIsSwitching(true);
    try {
      await setCurrentOrganization(orgId);
      router.refresh();
    } finally {
      setIsSwitching(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 w-full justify-between gap-2 px-3"
            disabled={isSwitching}
          >
            <div className="flex items-center gap-2 truncate">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-semibold text-primary-foreground">
                {currentOrganization ? getInitials(currentOrganization.name) : "?"}
              </div>
              <span className="truncate font-medium">
                {currentOrganization?.name || "Select Organization"}
              </span>
            </div>
            <CaretUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Organizations
          </DropdownMenuLabel>
          <div className="max-h-64 overflow-y-auto">
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSwitchOrganization(org.id)}
                className="cursor-pointer gap-2"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary">
                  {getInitials(org.name)}
                </div>
                <div className="flex flex-1 flex-col truncate">
                  <span className="truncate text-sm font-medium">{org.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {org.memberCount} {org.memberCount === 1 ? "member" : "members"}
                  </span>
                </div>
                {org.id === currentOrganization?.id && (
                  <Check className="size-4 shrink-0 text-primary" weight="bold" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsCreateModalOpen(true)}
            className="cursor-pointer gap-2"
          >
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/50">
              <Plus className="size-3.5 text-muted-foreground" weight="bold" />
            </div>
            <span className="text-sm">Create Organization</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
