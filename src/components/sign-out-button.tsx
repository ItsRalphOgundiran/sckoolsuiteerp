"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton({ className }: { className?: string }) {
  const handleClick = async () => {
    await signOut({ callbackUrl: `${window.location.origin}/login` });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      <LogOut className="h-4 w-4" />
      <span className="nav-label">Sign out</span>
    </button>
  );
}
