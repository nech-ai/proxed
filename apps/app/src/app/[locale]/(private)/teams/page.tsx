import { Footer } from "@/components/footer";
import { SelectTeamTable } from "@/components/teams/select-team-table";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getUser } from "@proxed/supabase/cached-queries";
import { getTeamMembershipsByUserIdQuery } from "@proxed/supabase/queries";
import { createClient } from "@proxed/supabase/server";
import { Button } from "@proxed/ui/components/button";
import { Logo } from "@/components/layout/logo";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Teams | Proxed.AI",
};

export default async function TeamsPage() {
  const supabase = await createClient();
  const user = await getUser();

  const teamsMemberships = await getTeamMembershipsByUserIdQuery(
    supabase,
    user?.data?.id ?? "",
  );
  if (!teamsMemberships?.data?.length) {
    redirect("/teams/create");
  }
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex w-full justify-end p-4">
        <ThemeToggle />
      </header>

      <div className="flex w-full flex-1 items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="relative mb-8 h-20 w-48">
            <Logo className="h-full w-full" withLabel={false} />
          </div>
          <SelectTeamTable
            activeTeamId={user?.data?.team_id}
            data={teamsMemberships.data}
          />
          <div className="mt-8 border-border border-t-[1px] pt-6 text-center">
            <Link href="/teams/create">
              <Button variant="default">Create team</Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
