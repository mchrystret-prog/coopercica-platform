import { SiteCustomization } from "@/components/admin/SiteCustomization";
import { getMagazines, getStores } from "@/lib/content";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [magazines, stores, params] = await Promise.all([getMagazines(), getStores(), searchParams]);
  return <SiteCustomization magazines={magazines} stores={stores} initialTab={params.tab === "magazine" ? "magazine" : undefined} />;
}
