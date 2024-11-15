"use client";

import { useEffect } from "react";
import { Member } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import { useSocket } from "@/hooks/use-socket";
import { useMotionStore } from "../../../stores/motion-store";
import { useSessionStore } from "../../../stores/session-store";

interface MemberQueueProps {
  members: Member[];
}

export function MemberQueue({ members }: MemberQueueProps) {
  const { isVotingActive } = useMotionStore();
  const { activeMember, setActiveMember, votedMembers, addVotedMember } =
    useSessionStore();
  const socket = useSocket();

  // Listen for vote completion
  useEffect(() => {
    if (socket) {
      socket.socket?.on("voteComplete", (memberId: string) => {
        addVotedMember(memberId);
      });

      return () => {
        socket.socket.off("voteComplete");
      };
    }
  }, [socket.socket, addVotedMember]);

  const handleSelectMember = (member: Member) => {
    setActiveMember(member);
  };

  const remainingMembers = members.filter(
    (member) => !votedMembers.has(member.id)
  );

  const votedMembersList = members.filter((member) =>
    votedMembers.has(member.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Members Queue</CardTitle>
          <div className="text-sm text-muted-foreground">
            {votedMembers.size} / {members.length} Voted
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {/* Remaining Members */}
            {remainingMembers.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Waiting to Vote
                </h3>
                {remainingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.constituency}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activeMember?.id === member.id ? (
                        <Badge>Current Speaker</Badge>
                      ) : (
                        <Button
                          size="sm"
                          disabled={!isVotingActive || activeMember !== null}
                          onClick={() => handleSelectMember(member)}
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Voted Members */}
            {votedMembersList.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Voted Members
                </h3>
                {votedMembersList.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg border bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.constituency}
                      </p>
                    </div>
                    <Badge variant="secondary">Voted</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
