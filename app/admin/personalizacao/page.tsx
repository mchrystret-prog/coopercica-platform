import { redirect } from "next/navigation";
import { SiteCustomization } from "@/components/admin/SiteCustomization";
import { getMagazines } from "@/lib/content";
import { legacyCustomizationDestinations, type CustomizationTab } from "@/lib/cms-customization-structure";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [params, magazines] = await Promise.all([searchParams, getMagazines()]);
  const destination = legacyCustomizationDestinations[params.tab as CustomizationTab];
  if (destination) redirect(destination);
  return <SiteCustomization magazines={magazines} initialTab={params.tab as CustomizationTab} />;
}
