export type Campaign = {
  id: string;
  title: string;
  eyebrow?: string;
  image: string;
  mobileImage?: string;
  href: string;
  cta?: string;
  active: boolean;
  order: number;
  accent: string;
};

export type Store = {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  address: string;
  hours: string;
  phone?: string;
  image: string;
  mapsUrl: string;
};

export type Magazine = {
  id: string;
  title: string;
  edition: string;
  cover: string;
  href: string;
};
