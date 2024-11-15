"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  GavelIcon,
  Users,
  Vote,
  History,
  Settings,
} from "lucide-react";

export function MainNav() {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      name: "Active Motions",
      href: "/motions",
      icon: GavelIcon,
      active: pathname === "/motions",
    },
    {
      name: "Members",
      href: "/members",
      icon: Users,
      active: pathname === "/members",
    },
    {
      name: "Live Voting",
      href: "/voting",
      icon: Vote,
      active: pathname === "/voting",
    },
    {
      name: "History",
      href: "/history",
      icon: History,
      active: pathname === "/history",
    },
  ];

  return (
    <div className="flex-1">
      <div className="flex items-center">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <GavelIcon className="h-6 w-6" />
          <span className="hidden font-bold text-lg md:inline-block">
            Parliament Voting
          </span>
        </Link>
        <nav className="flex items-center space-x-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                item.active
                  ? "bg-secondary text-secondary-foreground"
                  : "hover:bg-secondary/70 text-muted-foreground hover:text-secondary-foreground"
              )}
            >
              <item.icon className="h-4 w-4 mr-2" />
              <span className="hidden md:inline-block">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
