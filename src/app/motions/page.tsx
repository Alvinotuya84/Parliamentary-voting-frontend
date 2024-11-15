"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Motion } from "@/types";
import { MotionCard } from "@/components/motions/motion-card";
import { MotionList } from "@/components/motions/motion-list";
import { Button } from "@/components/ui/button";
import { CreateMotionDialog } from "@/components/motions/create-motion-dialog";

export default function MotionsPage() {
  const [view, setView] = useState<"list" | "grid">("grid");

  const { data: motions, isLoading } = useQuery({
    queryKey: ["motions"],
    queryFn: async () => {
      const response = await api.get<Motion[]>("/motions");
      return response.data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parliamentary Motions</h1>
          <p className="text-muted-foreground">
            View and vote on active parliamentary motions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateMotionDialog />
          <Button
            variant={view === "grid" ? "default" : "outline"}
            onClick={() => setView("grid")}
          >
            Grid
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
          >
            List
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {motions?.map((motion) => (
            <MotionCard key={motion.id} motion={motion} />
          ))}
        </div>
      ) : (
        <MotionList motions={motions || []} />
      )}
    </div>
  );
}
