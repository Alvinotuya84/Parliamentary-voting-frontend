"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { api } from "@/lib/axios";
import { useMotionStore } from "../../../stores/motion-store";
import { useSessionStore } from "../../../stores/session-store";

interface VotingBoothProps {
  motionId: string;
  onVoteComplete: () => void;
}

export function VotingBooth({ motionId, onVoteComplete }: VotingBoothProps) {
  const [progress, setProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const progressInterval = useRef<NodeJS.Timeout>();
  const recordingTimeout = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number | null>(null);

  const { toast } = useToast();
  const { isRecording, startRecording, stopRecording, cleanup } =
    useAudioRecorder();
  const { isVotingActive } = useMotionStore();
  const { activeMember } = useSessionStore();

  const RECORDING_DURATION = 5000; // 5 seconds for vote

  const clearTimers = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = undefined;
    }
    if (recordingTimeout.current) {
      clearTimeout(recordingTimeout.current);
      recordingTimeout.current = undefined;
    }
  };

  const handleStartVoting = async () => {
    if (!activeMember) {
      toast({
        title: "Error",
        description: "No active member selected",
        variant: "destructive",
      });
      return;
    }

    setProgress(0);
    setVerificationResult(null);
    const started = await startRecording();

    if (!started) return;

    startTimeRef.current = Date.now();

    progressInterval.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.min((elapsed / RECORDING_DURATION) * 100, 100);
        setProgress(newProgress);
      }
    }, 100);

    recordingTimeout.current = setTimeout(async () => {
      await handleStopVoting();
    }, RECORDING_DURATION);
  };

  const handleStopVoting = async () => {
    clearTimers();
    setProgress(100);
    startTimeRef.current = null;

    const audioData = await stopRecording();
    if (audioData && activeMember) {
      try {
        const response = await api.post(`/voting/cast-vote`, {
          voiceData: audioData,
          motionId,
          memberId: activeMember.id,
        });

        setVerificationResult(response.data.verification);

        toast({
          title: "Vote Recorded",
          description: `Vote: ${response.data.vote.vote} (Confidence: ${(
            response.data.verification.confidence * 100
          ).toFixed(1)}%)`,
        });

        onVoteComplete();
      } catch (error: any) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to process vote",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
      cleanup();
    };
  }, [cleanup]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Vote</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeMember ? (
          <>
            {isRecording && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  Recording... {Math.round(progress)}%
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium">Current Speaker</p>
                <p className="text-sm text-muted-foreground">
                  {activeMember.name} ({activeMember.constituency})
                </p>
              </div>
              <Button
                onClick={isRecording ? handleStopVoting : handleStartVoting}
                disabled={!isVotingActive}
                variant={isRecording ? "destructive" : "default"}
              >
                {isRecording ? (
                  <Square className="h-4 w-4 mr-2" />
                ) : (
                  <Mic className="h-4 w-4 mr-2" />
                )}
                {isRecording ? "Stop Recording" : "Record Vote"}
              </Button>
            </div>

            {verificationResult && (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Voice Match:</span>{" "}
                  {(verificationResult.similarity * 100).toFixed(1)}%
                </p>
                <p>
                  <span className="font-medium">Confidence:</span>{" "}
                  {(verificationResult.confidence * 100).toFixed(1)}%
                </p>
                <p>
                  <span className="font-medium">Detected Speech:</span>{" "}
                  {verificationResult.text}
                </p>
              </div>
            )}
          </>
        ) : (
          <Alert>
            <AlertDescription>
              Please select a member to begin voting.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
