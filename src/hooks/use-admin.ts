/**
 * Hook to check if the current Clerk user is an admin.
 * Admin status is read from the user's public metadata `role` claim.
 *
 * When Clerk is not configured, this returns a signed-out state without
 * invoking Clerk hooks (so the app works before Clerk keys are set).
 */

'use client';

import { useUser } from '@clerk/nextjs';
import { clerkEnabled } from '@/lib/clerk';

function useClerkAdmin() {
  const { user, isLoaded } = useUser();
  const role = (user?.publicMetadata?.role as string | undefined) ?? undefined;
  return {
    isAdmin: role === 'admin',
    isAdminLoading: !isLoaded,
    user,
  };
}

function useDisabledAdmin() {
  return { isAdmin: false, isAdminLoading: false, user: null };
}

// `clerkEnabled` is a build-time constant, so the same hook implementation is
// used consistently across every render (React hook rules are satisfied).
export const useAdmin = clerkEnabled ? useClerkAdmin : useDisabledAdmin;
