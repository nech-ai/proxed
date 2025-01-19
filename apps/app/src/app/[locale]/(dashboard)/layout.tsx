import { AppSidebar } from "@/components/layout/app-sidebar";
import { TeamContextProvider } from "@/shared/lib/team-context";
import { UserProvider } from "@/store/user/provider";
import { getTeamMemberships, getUser } from "@proxed/supabase/cached-queries";
import { SidebarProvider } from "@proxed/ui/components/sidebar";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Layout({ children }: PropsWithChildren) {
  // @ts-expect-error
  const { data: user } = await getUser();

  if (!user) {
    return redirect("/login");
  }

  if (!user.team_id) {
    return redirect("/teams");
  }

  const userTeamMemberships = await getTeamMemberships();
  const teamMemberships = userTeamMemberships?.data ?? [];

  if (!teamMemberships?.length) {
    return redirect("/teams/create");
  }

  const userData = {
    id: user.id,
    full_name: user.full_name ?? "",
    team_id: user.team_id,
    locale: "en-GB",
    date_format: "yyyy-MM-dd HH:mm:ss",
    timezone: "Europe/London",
  };

  return (
    <TeamContextProvider
      initialTeamId={user.team_id}
      allTeamMemberships={teamMemberships}
      user={user}
    >
      <UserProvider data={userData}>
        <div className="flex h-screen">
          <SidebarProvider defaultOpen={false}>
            <AppSidebar teamMemberships={teamMemberships} user={user} />
            <div className="flex flex-col overflow-hidden flex-1">
              {children}
            </div>
          </SidebarProvider>
        </div>
      </UserProvider>
    </TeamContextProvider>
  );
}
