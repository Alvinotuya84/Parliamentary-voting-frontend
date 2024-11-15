"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Save } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/axios";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

interface VoicePrintDialogProps {
  member: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VoicePrintDialog({
  member,
  open,
  onOpenChange,
  onSuccess,
}: VoicePrintDialogProps) {
  const [voicePrint, setVoicePrint] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout>();
  const recordingTimeout = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const { toast } = useToast();
  const { isRecording, startRecording, stopRecording, cleanup } =
    useAudioRecorder();

  const RECORDING_DURATION = 5000;

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

  const handleStartRecording = async () => {
    setProgress(0);
    setVoicePrint(null);
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
      await handleStopRecording();
    }, RECORDING_DURATION);
  };

  const handleStopRecording = async () => {
    clearTimers();
    setProgress(100);
    startTimeRef.current = null;

    const audioData = await stopRecording();
    if (audioData) {
      setVoicePrint(audioData);
    }
  };

  const playRecording = async () => {
    if (!voicePrint) return;

    try {
      if (isPlaying) {
        stopPlayback();
      }

      setIsPlaying(true);
      const audioBlob = new Blob(
        [Uint8Array.from(atob(voicePrint), (c) => c.charCodeAt(0))],
        { type: "audio/webm" }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
      toast({
        title: "Error",
        description: "Failed to play recording",
        variant: "destructive",
      });
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  const handleSave = async () => {
    if (!voicePrint) {
      toast({
        title: "Error",
        description: "Please record a voice sample",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      await api.post(`/members/${member.id}/voice-print`, {
        voicePrint,
      });

      toast({
        title: "Success",
        description: "Voice print saved successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Failed to save voice print",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
      cleanup();
      stopPlayback();
      setProgress(0);
    };
  }, [cleanup]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register Voice Print</DialogTitle>
          <DialogDescription>
            Record {member?.name}'s voice sample for 5 seconds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isRecording && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Recording... {Math.round(progress)}%
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">
                {voicePrint ? "Voice print recorded" : "Ready to record"}
              </p>
              <div className="flex space-x-2">
                {voicePrint && !isRecording && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={isPlaying ? stopPlayback : playRecording}
                  >
                    {isPlaying ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  onClick={
                    isRecording ? handleStopRecording : handleStartRecording
                  }
                  disabled={isSaving}
                  variant={isRecording ? "destructive" : "default"}
                >
                  {isRecording ? (
                    <Square className="h-4 w-4 mr-2" />
                  ) : (
                    <Mic className="h-4 w-4 mr-2" />
                  )}
                  {isRecording ? "Stop Recording" : "Record"}
                </Button>
              </div>
            </div>
          </div>

          {!voicePrint && !isRecording && (
            <Alert>
              <AlertDescription>
                Please record a voice sample of the MP speaking clearly.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isRecording || isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!voicePrint || isRecording || isSaving}
            >
              <Save
                className={cn("h-4 w-4 mr-2", isSaving && "animate-spin")}
              />
              {isSaving ? "Saving..." : "Save Voice Print"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
