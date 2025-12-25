"use client";

import { createContext, useContext, ReactNode } from "react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  logo: string | null;
}

interface OrganizationContextValue {
  currentOrganization: Organization | null;
  organizations: Organization[];
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(
  undefined
);

interface OrganizationProviderProps {
  children: ReactNode;
  currentOrganization: Organization | null;
  organizations: Organization[];
}

export function OrganizationProvider({
  children,
  currentOrganization,
  organizations,
}: OrganizationProviderProps) {
  return (
    <OrganizationContext.Provider
      value={{ currentOrganization, organizations }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useCurrentOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useCurrentOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
}
