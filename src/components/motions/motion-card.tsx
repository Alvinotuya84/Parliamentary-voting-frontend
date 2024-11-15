"use client";

import { useState } from "react";
import { Motion } from "@/types";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoteStats } from "@/components/votes/vote-stats";
import { format } from "date-fns";
import { useVoting } from "@/hooks/use-voting";
import { useVoice } from "@/hooks/use-voice";
import { useSessionStore } from "../../../stores/session-store";
import { useMotionStore } from "../../../stores/motion-store";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface MotionCardProps {
  motion: Motion;
}

export function MotionCard({ motion }: MotionCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const { activeMember } = useSessionStore();
  const { isVotingActive } = useMotionStore();
  const { startRecording, stopRecording } = useVoice();
  const { castVote } = useVoting();
  const { toast } = useToast();
  const router = useRouter();

  const handleVoteStart = async () => {
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

  const handleVoteStop = async () => {
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
  const handleClick = () => {
    router.push(`/motions/${motion.id}`);
  };
  const canVote = isVotingActive && activeMember && motion.status === "active";

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleClick}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1">{motion.title}</CardTitle>
          <Badge variant={motion.status === "active" ? "default" : "secondary"}>
            {motion.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {motion.description}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Proposed by:</span>
            <span className="font-medium">{motion.proposedBy}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="font-medium">
              {format(new Date(motion.dateProposed), "PPP")}
            </span>
          </div>
        </div>
        {motion.status === "active" && <VoteStats motionId={motion.id} />}
      </CardContent>
      {canVote && (
        <CardFooter>
          <Button
            className="w-full"
            onClick={isVoting ? handleVoteStop : handleVoteStart}
            variant={isVoting ? "destructive" : "default"}
          >
            {isVoting
              ? `Stop Recording for ${activeMember.name}`
              : `Cast Vote as ${activeMember.name}`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
