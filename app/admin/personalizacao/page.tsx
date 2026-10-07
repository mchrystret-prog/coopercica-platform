import { SiteCustomization } from "@/components/admin/SiteCustomization";
import { getMagazines } from "@/lib/content";
export default async function Page() {
  return <SiteCustomization magazines={await getMagazines()} />;
}
