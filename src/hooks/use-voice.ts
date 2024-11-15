import { useState, useCallback } from "react";
import { useToast } from "./use-toast";

export function useVoice() {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorder) return null;

    return new Promise<string>((resolve) => {
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioChunks([]);
          resolve(base64Audio.split(",")[1]); // Remove data URL prefix
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    });
  }, [mediaRecorder, audioChunks]);

  return {
    startRecording,
    stopRecording,
  };
}
