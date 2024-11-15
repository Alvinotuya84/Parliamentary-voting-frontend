import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorder.current) {
      if (mediaRecorder.current.state === "recording") {
        mediaRecorder.current.stop();
      }
      mediaRecorder.current = null;
    }
    audioChunks.current = [];
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      cleanup();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;
      audioChunks.current = [];

      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current = recorder;
      recorder.start();
      setIsRecording(true);

      return true;
    } catch (error) {
      console.error("Recording error:", error);
      cleanup();
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
      return false;
    }
  }, [cleanup, toast]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (
        !mediaRecorder.current ||
        mediaRecorder.current.state !== "recording"
      ) {
        cleanup();
        resolve(null);
        return;
      }

      mediaRecorder.current.onstop = async () => {
        try {
          if (audioChunks.current.length === 0) {
            cleanup();
            resolve(null);
            return;
          }

          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/webm",
          });
          const reader = new FileReader();

          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            cleanup();
            resolve(base64Audio.split(",")[1]);
          };

          reader.onerror = () => {
            console.error("FileReader error");
            cleanup();
            resolve(null);
          };

          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error("Audio processing error:", error);
          cleanup();
          resolve(null);
        }
      };

      mediaRecorder.current.stop();
    });
  }, [cleanup]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    cleanup,
  };
};
