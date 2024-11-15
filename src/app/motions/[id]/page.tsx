"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { VotingStatus } from "@/components/voting/voting-status";
import { MemberQueue } from "@/components/voting/member-queue";
import { VoteVisualizer } from "@/components/voting/vote-visualizer";
import { VotingBooth } from "@/components/voting/voting-booth";
import { Button } from "@/components/ui/button";
import { useMotionStore } from "../../../../stores/motion-store";
import { useSessionStore } from "../../../../stores/session-store";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { use } from "react";

export default function MotionVotingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { isVotingActive, setVotingActive } = useMotionStore();
  const { setActiveMember, clearVotedMembers } = useSessionStore();
  const unwrappedParams = use(params);

  const { data: motion } = useQuery({
    queryKey: ["motion", unwrappedParams.id],
    queryFn: async () => {
      const response = await api.get(`/motions/${unwrappedParams.id}`);
      return response.data;
    },
  });

  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const response = await api.get("/members");
      return response.data;
    },
  });

  const handleStartVoting = () => {
    setVotingActive(true);
    clearVotedMembers();
  };

  const handleStopVoting = () => {
    setVotingActive(false);
    setActiveMember(null);
  };

  const handleVoteComplete = () => {
    setActiveMember(null);
  };

  const handleCompleteVoting = async () => {
    handleVoteComplete();
    try {
      await api.put(`/motions/${unwrappedParams.id}/status`, {
        status: "completed",
      });
      router.push(`/motions/${unwrappedParams.id}/complete`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete voting session",
        variant: "destructive",
      });
    }
  };

  if (!motion || !members) return null;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{motion.title}</h1>
          <p className="text-muted-foreground">{motion.description}</p>
        </div>
        <Button
          onClick={isVotingActive ? handleStopVoting : handleStartVoting}
          variant={isVotingActive ? "destructive" : "default"}
        >
          {isVotingActive ? "End Voting Session" : "Start Voting Session"}
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <VotingStatus />
          <VotingBooth
            motionId={unwrappedParams.id}
            onVoteComplete={handleCompleteVoting}
          />
          <VoteVisualizer motionId={unwrappedParams.id} />
        </div>
        <div className="col-span-4">
          <MemberQueue members={members} />
        </div>
      </div>
    </div>
  );
}
