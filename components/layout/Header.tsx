import { getActiveLeaflets } from "@/lib/leaflets";
import { HeaderNavigation } from "./HeaderNavigation";

type HeaderProps = {
  logo?: string;
  siteName?: string;
  deliveryUrl?: string;
  hasOffers?: boolean;
};

export async function Header({ hasOffers, ...props }: HeaderProps = {}) {
  const offersAvailable = hasOffers ?? (await getActiveLeaflets()).length > 0;

  return <HeaderNavigation {...props} hasOffers={offersAvailable} />;
}
