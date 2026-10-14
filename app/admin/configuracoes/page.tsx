import { redirect } from "next/navigation";
import { SiteCustomization } from "@/components/admin/SiteCustomization";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  if (params.tab && ["identity", "contact", "sharing"].includes(params.tab)) redirect(`/admin/personalizacao?tab=${params.tab}`);
  return <SiteCustomization module="settings" />;
}
