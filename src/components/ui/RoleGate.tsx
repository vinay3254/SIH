import React from 'react';

type UserRole = 'Analyst' | 'Supervisor' | 'Admin';

interface RoleGateProps {
  roles: UserRole[];
  currentRole?: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Backend integration point: replace currentRole with value from auth store / JWT claims
const CURRENT_USER_ROLE: UserRole = 'Analyst';

export default function RoleGate({
  roles,
  currentRole = CURRENT_USER_ROLE,
  children,
  fallback = null,
}: RoleGateProps) {
  if (!roles.includes(currentRole)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}