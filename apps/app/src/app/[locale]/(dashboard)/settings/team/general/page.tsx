import { ChangeTeamAvatar } from "@/components/settings/team/general/change-team-avatar";
import { DeleteTeam } from "@/components/settings/team/general/delete-team";
import { DisplayTeamName } from "@/components/settings/team/general/display-team-name";
import { getUser } from "@proxed/supabase/cached-queries";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  return {
    title: "Team Settings",
  };
}

export default async function TeamSettingsPage() {
  const userData = await getUser();

  if (!userData?.data) {
    redirect("/login");
  }

  if (!userData.data.team) {
    redirect("/settings/team/general");
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <ChangeTeamAvatar team={userData.data.team} />
      <DisplayTeamName teamName={userData.data.team?.name ?? ""} />
      <DeleteTeam teamId={userData.data.team.id} />
    </div>
  );
}
