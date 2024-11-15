"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">
          Parliament Voting
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/motions"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/motions" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Motions
        </Link>
        <Link
          href="/members"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/members" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Members
        </Link>
        <Link
          href="/votes"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/votes")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Votes
        </Link>
      </nav>
    </div>
  );
}
