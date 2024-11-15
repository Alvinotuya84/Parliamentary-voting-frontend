"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BarChart, Users, GavelIcon, Vote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Motion } from "@/types";
import { useSessionStore } from "../../stores/session-store";
import { useMotionStore } from "../../stores/motion-store";

export default function DashboardPage() {
  const { activeMember } = useSessionStore();
  const { isVotingActive } = useMotionStore();

  const { data: activeMotions } = useQuery({
    queryKey: ["active-motions"],
    queryFn: async () => {
      const response = await api.get<Motion[]>("/motions/active/all");
      return response.data;
    },
  });

  const stats = [
    {
      title: "Active Motions",
      value: activeMotions?.length || 0,
      icon: GavelIcon,
      description: "Motions currently in session",
    },
    {
      title: "Current Speaker",
      value: activeMember?.name || "None",
      icon: Users,
      description: activeMember?.constituency || "No active speaker",
    },
    {
      title: "Voting Status",
      value: isVotingActive ? "In Progress" : "Inactive",
      icon: Vote,
      description: "Current voting session status",
    },
    {
      title: "Today's Votes",
      value: "156",
      icon: BarChart,
      description: "Total votes cast today",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Active Motions</CardTitle>
          </CardHeader>
          <CardContent>
            {activeMotions?.length === 0 ? (
              <p className="text-muted-foreground">No active motions</p>
            ) : (
              <div className="space-y-4">
                {activeMotions?.map((motion) => (
                  <div
                    key={motion.id}
                    className="flex items-start justify-between border-b pb-4"
                  >
                    <div>
                      <h3 className="font-semibold">{motion.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {motion.description}
                      </p>
                    </div>
                    <div className="text-sm">
                      Proposed by: {motion.proposedBy}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Motion XYZ Passed</p>
                  <p className="text-sm text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              {/* Add more activity items */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
