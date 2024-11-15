"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VoteVisualizer } from "@/components/voting/vote-visualizer";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#22c55e", "#ef4444"];

export function MotionResults({ motion, stats }: any) {
  const data = [
    { name: "Yes", value: stats.yes },
    { name: "No", value: stats.no },
  ];

  const result = stats.yes > stats.no ? "PASSED" : "REJECTED";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Final Result</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div
            className={cn(
              "text-4xl font-bold mb-4",
              result === "PASSED" ? "text-green-500" : "text-red-500"
            )}
          >
            {result}
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vote Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <VoteVisualizer motionId={motion.id} />
        </CardContent>
      </Card>
    </div>
  );
}
