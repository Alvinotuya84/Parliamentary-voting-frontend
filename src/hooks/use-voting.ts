// src/hooks/use-voting.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useToast } from "./use-toast";

interface CastVoteParams {
  voiceData: string;
  motionId: string;
  memberId: string;
}

export function useVoting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const castVoteMutation = useMutation({
    mutationFn: async (params: CastVoteParams) => {
      const response = await api.post("/voting/cast-vote", params);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Vote Cast",
        description: "Your vote has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["vote-stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    castVote: castVoteMutation.mutateAsync,
    isVoting: castVoteMutation.isPending,
  };
}
