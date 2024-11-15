"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  GavelIcon,
  Users,
  Vote,
  History,
  Settings,
  Menu,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
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
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ];

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col border-r bg-background",
        expanded ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        {expanded && (
          <span className="ml-2 font-semibold">Parliament Voting</span>
        )}
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  !expanded && "justify-center"
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", expanded ? "mr-2" : "mr-0")}
                />
                {expanded && item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
