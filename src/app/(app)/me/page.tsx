import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { getProfileByHandle } from "@/lib/data-profile";
import { ProfileView } from "@/components/profile-view";

export const metadata = { title: "My profile — FIO" };

export default async function MyProfilePage() {
  const user = await requireUser();
  const data = await getProfileByHandle(user.id);
  if (!data) redirect("/settings");
  if (data.profile.username) redirect(`/u/${data.profile.username}`);
  return <ProfileView data={data} />;
}
