// src/components/motions/motion-list.tsx
"use client";

import { Motion } from "@/types";

import { useVoice } from "@/hooks/use-voice";
import { useVoting } from "@/hooks/use-voting";
import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoteStats } from "@/components/votes/vote-stats";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronRight, Mic, MicOff } from "lucide-react";
import { useSessionStore } from "../../../stores/session-store";
import { useMotionStore } from "../../../stores/motion-store";
import { useToast } from "@/hooks/use-toast";

interface MotionListProps {
  motions: Motion[];
}

export function MotionList({ motions }: MotionListProps) {
  const [selectedMotion, setSelectedMotion] = useState<Motion | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const { activeMember } = useSessionStore();
  const { isVotingActive } = useMotionStore();
  const { startRecording, stopRecording } = useVoice();
  const { castVote } = useVoting();
  const { toast } = useToast();

  const handleVoteStart = async (motion: Motion) => {
    if (!activeMember) {
      toast({
        title: "Error",
        description: "No active member selected",
        variant: "destructive",
      });
      return;
    }
    setIsVoting(true);
    await startRecording();
  };

  const handleVoteStop = async (motion: Motion) => {
    setIsVoting(false);
    const voiceData = await stopRecording();
    if (voiceData && activeMember) {
      await castVote({
        voiceData,
        motionId: motion.id,
        memberId: activeMember.id,
      });
    }
  };

  const canVote = (motion: Motion) =>
    isVotingActive && activeMember && motion.status === "active";

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Title</TableHead>
            <TableHead>Proposed By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {motions.map((motion) => (
            <TableRow key={motion.id}>
              <TableCell className="font-medium">{motion.title}</TableCell>
              <TableCell>{motion.proposedBy}</TableCell>
              <TableCell>
                {format(new Date(motion.dateProposed), "PPP")}
              </TableCell>
              <TableCell>
                <Badge
                  variant={motion.status === "active" ? "default" : "secondary"}
                >
                  {motion.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  {canVote(motion) && (
                    <Button
                      variant={isVoting ? "destructive" : "default"}
                      size="sm"
                      onClick={() =>
                        isVoting
                          ? handleVoteStop(motion)
                          : handleVoteStart(motion)
                      }
                    >
                      {isVoting ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMotion(motion)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>{motion.title}</SheetTitle>
                        <SheetDescription>
                          {motion.description}
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Details</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">
                              Proposed By
                            </div>
                            <div>{motion.proposedBy}</div>
                            <div className="text-muted-foreground">Date</div>
                            <div>
                              {format(new Date(motion.dateProposed), "PPP")}
                            </div>
                            <div className="text-muted-foreground">Status</div>
                            <div>
                              <Badge
                                variant={
                                  motion.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {motion.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {motion.status === "active" && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">
                              Current Voting Status
                            </h4>
                            <VoteStats motionId={motion.id} />
                          </div>
                        )}
                        {canVote(motion) && (
                          <Button
                            className="w-full"
                            variant={isVoting ? "destructive" : "default"}
                            onClick={() =>
                              isVoting
                                ? handleVoteStop(motion)
                                : handleVoteStart(motion)
                            }
                          >
                            {isVoting ? (
                              <>
                                <MicOff className="mr-2 h-4 w-4" />
                                Stop Recording
                              </>
                            ) : (
                              <>
                                <Mic className="mr-2 h-4 w-4" />
                                Record Vote
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
