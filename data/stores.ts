export interface Store {
  id: number;
  storeNumber: number;
  slug: string;
  name: string;
  city: string;
  neighborhood: string;
  address: string;
  mapsUrl: string;
  phone: string;
  hours: string;
  image: string;
  maps: string;
  latitude?: number;
  longitude?: number;
  featured?: boolean;
  active: boolean;
  services: string[];
}

export const stores: Store[] = [