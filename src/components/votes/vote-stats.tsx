"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useSocket } from "@/hooks/use-socket";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VoteStatistics } from "@/types";
import { useSessionStore } from "../../../stores/session-store";

interface VoteStatsProps {
  motionId: string;
}

export function VoteStats({ motionId }: VoteStatsProps) {
  const { subscribe } = useSocket();
  const { activeMember } = useSessionStore();

  const { data: stats, refetch } = useQuery<VoteStatistics>({
    queryKey: ["vote-stats", motionId],
    queryFn: async () => {
      const response = await api.get(`/voting/statistics/${motionId}`);
      return response.data;
    },
  });

  useEffect(() => {
    // Subscribe to vote updates
    const unsubscribe = subscribe("voteUpdate", (data) => {
      if (data.motionId === motionId) {
        refetch();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [motionId, subscribe, refetch]);

  if (!stats) return null;

  const yesPercentage = (stats.yes / (stats.total || 1)) * 100;
  const noPercentage = (stats.no / (stats.total || 1)) * 100;

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Yes ({stats.yes})</span>
          <span>{yesPercentage.toFixed(1)}%</span>
        </div>
        <Progress value={yesPercentage} className="h-2" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>No ({stats.no})</span>
          <span>{noPercentage.toFixed(1)}%</span>
        </div>
        <Progress value={noPercentage} className="h-2" />
      </div>
      {activeMember && (
        <Alert>
          <AlertDescription>
            Current Speaker: {activeMember.name} ({activeMember.constituency})
          </AlertDescription>
        </Alert>
      )}
      <Alert>
        <AlertDescription>Total Votes: {stats.total}</AlertDescription>
      </Alert>
    </div>
  );
}
