"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { MembersTable } from "@/components/members/members-table";
import { VoicePrintDialog } from "@/components/members/voice-print-dialog";
import { AddMemberDialog } from "@/components/members/add-members-dialog";

export default function MembersPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [voicePrintMember, setVoicePrintMember] = useState<any>(null);

  const { data: members, refetch } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const response = await api.get("/members");
      return response.data;
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members of Parliament</h1>
          <p className="text-muted-foreground">
            Manage parliamentary members and their voice prints
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <MembersTable
        members={members || []}
        onVoicePrint={setVoicePrintMember}
      />

      <AddMemberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={refetch}
      />

      <VoicePrintDialog
        member={voicePrintMember}
        open={!!voicePrintMember}
        onOpenChange={(open) => !open && setVoicePrintMember(null)}
        onSuccess={refetch}
      />
    </div>
  );
}
