"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Member } from "@/types";
import { useSessionStore } from "../../../stores/session-store";
import { useMotionStore } from "../../../stores/motion-store";

interface MotionControllerProps {
  members: Member[];
}

export function MotionController({ members }: MotionControllerProps) {
  const { setActiveMember, activeMember } = useSessionStore();
  const { isVotingActive, setVotingActive, currentSpeaker } = useMotionStore();

  const nextMember = () => {
    const currentIndex = members.findIndex((m) => m.id === activeMember?.id);
    const nextMember = members[currentIndex + 1];
    if (nextMember) {
      setActiveMember(nextMember);
    } else {
      // End of voting session
      setVotingActive(false);
      setActiveMember(null);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Motion Control Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Current Speaker:</span>
            <span className="font-medium">
              {activeMember
                ? `${activeMember.name} (${activeMember.constituency})`
                : "None"}
            </span>
          </div>
          <div className="flex space-x-4">
            <Button
              className="flex-1"
              onClick={() => setVotingActive(!isVotingActive)}
              variant={isVotingActive ? "destructive" : "default"}
            >
              {isVotingActive ? "Stop Voting Session" : "Start Voting Session"}
            </Button>
            <Button
              className="flex-1"
              onClick={nextMember}
              disabled={!isVotingActive || !activeMember}
            >
              Next Member
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
