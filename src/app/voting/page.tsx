// src/app/voting/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";
import { useVoice } from "@/hooks/use-voice";
import { useMotionStore } from "../../../stores/motion-store";
import { useSessionStore } from "../../../stores/session-store";
import { useToast } from "@/hooks/use-toast";
import { VoteVisualizer } from "@/components/voting/voting-visualizer";

export default function VotingPage() {
  const { isVotingActive, currentSpeaker } = useMotionStore();
  const { activeMotionId } = useSessionStore();
  const { startRecording, stopRecording } = useVoice();
  const { toast } = useToast();
  const [isRecordingVote, setIsRecordingVote] = useState(false);

  // Fetch active motion details
  const { data: activeMotion } = useQuery({
    queryKey: ["motion", activeMotionId],
    queryFn: async () => {
      if (!activeMotionId) return null;
      const response = await api.get(`/motions/${activeMotionId}`);
      return response.data;
    },
    enabled: !!activeMotionId,
  });

  // Fetch current speaker details
  const { data: speaker } = useQuery({
    queryKey: ["member", currentSpeaker],
    queryFn: async () => {
      if (!currentSpeaker) return null;
      const response = await api.get(`/members/${currentSpeaker}`);
      return response.data;
    },
    enabled: !!currentSpeaker,
  });

  const handleVoteStart = async () => {
    try {
      await startRecording();
      setIsRecordingVote(true);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Could not access microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const handleVoteStop = async () => {
    try {
      const voiceData = await stopRecording();
      setIsRecordingVote(false);

      if (voiceData && currentSpeaker && activeMotionId) {
        await api.post("/voting/cast-vote", {
          voiceData,
          motionId: activeMotionId,
          memberId: currentSpeaker,
        });
        toast({
          title: "Vote Recorded",
          description: "Your vote has been successfully recorded.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      });
      setIsRecordingVote(false);
    }
  };

  if (!isVotingActive) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>No Active Voting Session</CardTitle>
            <CardDescription>
              Please wait for the clerk to initiate a voting session.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Motion Information */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Active Motion</CardTitle>
          <CardDescription className="text-lg">
            {activeMotion?.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{activeMotion?.description}</p>
          <div className="mt-4 text-sm">
            <p>Proposed by: {activeMotion?.proposedBy}</p>
            <p>
              Date:{" "}
              {activeMotion?.dateProposed &&
                new Date(activeMotion.dateProposed).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Speaker and Vote Controls */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className={currentSpeaker ? "border-2 border-green-500" : ""}>
          <CardHeader>
            <CardTitle>Current Speaker</CardTitle>
          </CardHeader>
          <CardContent>
            {speaker ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{speaker.name}</h3>
                  <p className="text-muted-foreground">
                    {speaker.constituency}
                  </p>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  variant={isRecordingVote ? "destructive" : "default"}
                  onClick={isRecordingVote ? handleVoteStop : handleVoteStart}
                >
                  {isRecordingVote ? (
                    <>
                      <MicOff className="mr-2 h-5 w-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-5 w-5" />
                      Record Vote
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Waiting for speaker selection...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Live Vote Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Live Vote Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <VoteVisualizer motionId={activeMotionId!} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
