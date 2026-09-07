import { notFound } from "next/navigation";
import { getProfileByHandle } from "@/lib/data-profile";
import { ProfileView } from "@/components/profile-view";

export async function generateMetadata({ params }: PageProps<"/u/[handle]">) {
  const { handle } = await params;
  const data = await getProfileByHandle(handle);
  const name = data?.profile.display_name || data?.profile.username || "Profile";
  return { title: `${name} — FIO` };
}

export default async function ProfilePage({ params }: PageProps<"/u/[handle]">) {
  const { handle } = await params;
  const data = await getProfileByHandle(handle);
  if (!data) notFound();
  return <ProfileView data={data} />;
}
