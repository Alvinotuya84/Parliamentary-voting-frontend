"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { MotionResults } from "@/components/motions/motion-results";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MotionCompletePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const { data: motion } = useQuery({
    queryKey: ["motion", params.id],
    queryFn: async () => {
      const response = await api.get(`/motions/${params.id}`);
      return response.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["vote-stats", params.id],
    queryFn: async () => {
      const response = await api.get(`/voting/statistics/${params.id}`);
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
