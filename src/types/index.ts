export interface Member {
  id: string;
  name: string;
  constituency: string;
  role: string;
  isActive: boolean;
}

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
  member: Member;
  motion: Motion;
  vote: "yes" | "no";
  timestamp: Date;
  voiceRecording?: string;
}

export interface VoteStatistics {
  total: number;
  yes: number;
  no: number;
  byConstituency: {
    [key: string]: {
      yes: number;
      no: number;
    };
  };
}
