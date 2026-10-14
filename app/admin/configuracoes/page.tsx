import { SiteCustomization } from "@/components/admin/SiteCustomization";
import type { CustomizationTab } from "@/lib/cms-customization-structure";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  return <SiteCustomization module="settings" initialTab={params.tab as CustomizationTab} />;
}
