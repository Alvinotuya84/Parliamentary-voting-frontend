"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMotionStore } from "../../../stores/motion-store";
import { useSessionStore } from "../../../stores/session-store";

export function VotingStatus() {
  const { isVotingActive } = useMotionStore();
  const { activeMember } = useSessionStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Session Status:</span>
          <Badge variant={isVotingActive ? "default" : "secondary"}>
            {isVotingActive ? "In Progress" : "Not Active"}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>Current Speaker:</span>
          <span className="font-medium">
            {activeMember ? activeMember.name : "None"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
