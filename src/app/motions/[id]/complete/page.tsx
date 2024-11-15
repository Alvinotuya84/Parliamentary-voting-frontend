"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { MotionResults } from "@/components/motions/motion-results";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function MotionCompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);

  const router = useRouter();

  const { data: motion } = useQuery({
    queryKey: ["motion", unwrappedParams.id],
    queryFn: async () => {
      const response = await api.get(`/motions/${unwrappedParams.id}`);
      return response.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["vote-stats", unwrappedParams.id],
    queryFn: async () => {
      const response = await api.get(
        `/voting/statistics/${unwrappedParams.id}`
      );
      return response.data;
    },
  });

  if (!motion || !stats) return null;

  return (
    <div className="container py-6">
      <div className="mb-6 space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{motion.title}</h1>
          <Button variant="outline" onClick={() => router.push("/motions")}>
            Back to Motions
          </Button>
        </div>
        <p className="text-muted-foreground">{motion.description}</p>
      </div>

      <MotionResults motion={motion} stats={stats} />
    </div>
  );
}
