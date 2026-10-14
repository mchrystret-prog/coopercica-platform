import { redirect } from "next/navigation";
import { SiteCustomization } from "@/components/admin/SiteCustomization";
import { legacyCustomizationDestinations, type CustomizationTab } from "@/lib/cms-customization-structure";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const destination = legacyCustomizationDestinations[params.tab as CustomizationTab];
  if (destination) redirect(destination);
  return <SiteCustomization initialTab={params.tab as CustomizationTab} />;
}
