"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useSocket } from "@/hooks/use-socket";
import { useEffect } from "react";

interface VoteVisualizerProps {
  motionId: string;
}

export function VoteVisualizer({ motionId }: VoteVisualizerProps) {
  const socket = useSocket();

  const { data: stats, refetch } = useQuery({
    queryKey: ["vote-stats", motionId],
    queryFn: async () => {
      const response = await api.get(`/voting/statistics/${motionId}`);
      return response.data;
    },
    enabled: !!motionId,
  });

  useEffect(() => {
    if (socket) {
      socket.socket.on("voteUpdate", refetch);
      return () => {
        socket.socket.off("voteUpdate");
      };
    }
  }, [socket.socket, refetch]);

  if (!stats) return null;

  const yesPercentage = (stats.yes / stats.total) * 100 || 0;
  const noPercentage = (stats.no / stats.total) * 100 || 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Yes ({stats.yes})</span>
          <span className="text-sm font-medium">
            {yesPercentage.toFixed(1)}%
          </span>
        </div>
        <Progress value={yesPercentage} className="h-2 bg-green-100">
          <div className="h-full bg-green-500 transition-all" />
        </Progress>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">No ({stats.no})</span>
          <span className="text-sm font-medium">
            {noPercentage.toFixed(1)}%
          </span>
        </div>
        <Progress value={noPercentage} className="h-2 bg-red-100">
          <div className="h-full bg-red-500 transition-all" />
        </Progress>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Votes</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {((stats.total / stats.totalMembers) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Participation</div>
        </Card>
      </div>
    </div>
  );
}
