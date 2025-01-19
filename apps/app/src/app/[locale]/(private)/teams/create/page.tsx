import { Footer } from "@/components/footer";
import { CreateTeamForm } from "@/components/teams/create-team-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getUser } from "@proxed/supabase/cached-queries";
import { createClient } from "@proxed/supabase/server";
import { Logo } from "@/components/layout/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Team | Proxed.AI",
};

export default async function TeamsCreatePage() {
  const supabase = await createClient();
  const user = await getUser();

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
          <CreateTeamForm />
        </div>
      </div>

      <Footer />
    </div>
  );
}
