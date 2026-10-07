import { SiteCustomization } from "@/components/admin/SiteCustomization";
import { getMagazines } from "@/lib/content";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [magazines, params] = await Promise.all([getMagazines(), searchParams]);
  return <SiteCustomization magazines={magazines} initialTab={params.tab === "magazine" ? "magazine" : undefined} />;
}
