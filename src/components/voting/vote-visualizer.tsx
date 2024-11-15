"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/hooks/use-socket";
import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
    if (socket?.socket) {
      socket.socket.on("voteUpdate", refetch);
      return () => {
        socket.socket.off("voteUpdate");
      };
    }
  }, [socket?.socket, refetch]);

  if (!stats) return null;

  const yesPercentage = (stats.yes / stats.total) * 100 || 0;
  const noPercentage = (stats.no / stats.total) * 100 || 0;

  const constituencyData = Object.entries(stats.byConstituency).map(
    ([name, votes]: [string, any]) => ({
      name,
      yes: votes.yes,
      no: votes.no,
    })
  );

  return (
    <div className="space-y-6">
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

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Yes ({stats.yes})</span>
            <span className="text-sm font-medium">
              {yesPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={yesPercentage} className="h-3">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${yesPercentage}%` }}
            />
          </Progress>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">No ({stats.no})</span>
            <span className="text-sm font-medium">
              {noPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={noPercentage} className="h-3">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${noPercentage}%` }}
            />
          </Progress>
        </div>
      </div>

      <div className="h-[300px] mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={constituencyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="yes" fill="#22c55e" name="Yes" />
            <Bar dataKey="no" fill="#ef4444" name="No" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {stats.latestVotes && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-3">Latest Votes</h3>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {stats.latestVotes.map((vote: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{vote.memberName}</p>
                      <p className="text-sm text-muted-foreground">
                        {vote.constituency}
                      </p>
                    </div>
                    <Badge
                      variant={vote.vote === "yes" ? "default" : "destructive"}
                    >
                      {vote.vote.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </Card>
      )}
    </div>
  );
}
