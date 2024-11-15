"use client";

import { useState } from "react";

import { Motion } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/axios";
import { useSessionStore } from "../../../stores/session-store";
import { useMotionStore } from "../../../stores/motion-store";

interface MotionControlProps {
  motions: Motion[];
}

export function MotionControl({ motions }: MotionControlProps) {
  const { setActiveMotion } = useSessionStore();
  const { isVotingActive, setVotingActive } = useMotionStore();
  const [selectedMotion, setSelectedMotion] = useState<string>("");

  const handleStartVoting = async () => {
    if (!selectedMotion) return;

    await api.put(`/motions/${selectedMotion}/status`, { status: "active" });
    setActiveMotion(selectedMotion);
    setVotingActive(true);
  };

  const handleStopVoting = async () => {
    if (!selectedMotion) return;

    await api.put(`/motions/${selectedMotion}/status`, { status: "completed" });
    setActiveMotion(null);
    setVotingActive(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Motion Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          disabled={isVotingActive}
          value={selectedMotion}
          onValueChange={setSelectedMotion}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a motion" />
          </SelectTrigger>
          <SelectContent>
            {motions.map((motion) => (
              <SelectItem key={motion.id} value={motion.id}>
                {motion.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          className="w-full"
          onClick={isVotingActive ? handleStopVoting : handleStartVoting}
          variant={isVotingActive ? "destructive" : "default"}
          disabled={!selectedMotion && !isVotingActive}
        >
          {isVotingActive ? "End Voting Session" : "Start Voting Session"}
        </Button>
      </CardContent>
    </Card>
  );
}
