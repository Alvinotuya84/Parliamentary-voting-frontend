export interface Member {
  id: string;
  name: string;
  constituency: string;
  role: string;
  isActive: boolean;
}

// src/types/index.ts
export interface Motion {
  id: string;
  title: string;
  description: string;
  proposedBy: string;
  dateProposed: Date;
  status: "pending" | "active" | "completed";
  summary?: string;
}

export interface Vote {
  id: string;
  memberId: string;
  motionId: string;
  vote: "yes" | "no";
  timestamp: Date;
  voiceRecording?: string;
}

export interface VoteStatistics {
  total: number;
  yes: number;
  no: number;
  totalMembers: number;
  byConstituency: {
    [key: string]: {
      yes: number;
      no: number;
    };
  };
}
