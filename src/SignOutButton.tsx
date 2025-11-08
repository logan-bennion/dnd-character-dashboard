"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-3 py-1 rounded bg-gray-700 text-gray-100 border border-gray-600 font-semibold text-xs hover:bg-gray-600 transition-colors"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
