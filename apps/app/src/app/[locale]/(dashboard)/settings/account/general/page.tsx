import { ChangeAvatar } from "@/components/settings/account/general/change-avatar";
import { ChangeEmail } from "@/components/settings/account/general/change-email";
import { DeleteAccount } from "@/components/settings/account/general/delete-account";
import { DisplayName } from "@/components/settings/account/general/display-name";
import { getUser } from "@proxed/supabase/cached-queries";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  return {
    title: "Account Settings",
  };
}

export default async function AccountSettingsPage() {
  const userData = await getUser();

  if (!userData?.data) {
    redirect("/login");
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <ChangeAvatar user={userData.data} />
      <DisplayName fullName={userData.data.full_name ?? ""} />
      <ChangeEmail email={userData.data.email ?? ""} />
      <DeleteAccount />
    </div>
  );
}
