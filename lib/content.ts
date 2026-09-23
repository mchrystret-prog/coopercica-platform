import { campaigns } from "@/data/campaigns";
import { stores as fallbackStores, type Store } from "@/data/stores";
import { magazines as fallbackMagazines } from "@/data/content";
import type { Magazine } from "@/types/content";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/leaflets";

async function publicRows<T>(table:string, order:string):Promise<T[]|null>{
  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&active=eq.true&order=${order}`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY},cache:"no-store"});
    if(!r.ok)return null;
    return await r.json();
  }catch{return null}
}
export async function getCampaigns(){const rows=await publicRows<any>("site_campaigns","sort_order.asc");if(!rows?.length)return campaigns.filter(c=>c.active).sort((a,b)=>a.order-b.order);return rows.map(r=>({id:r.id,title:r.title,desktopImage:r.desktop_image_url,mobileImage:r.mobile_image_url||r.desktop_image_url,href:r.href,target:r.target,active:r.active,order:r.sort_order,backgroundColor:r.background_color||undefined}))}
export async function getStores():Promise<Store[]>{
  const rows=await publicRows<any>("site_stores","store_number.asc");
  if(!rows?.length)return fallbackStores;
  return rows.map(r=>({id:r.store_number,storeNumber:r.store_number,slug:r.slug,name:r.name,city:r.city,neighborhood:r.neighborhood,address:r.address,mapsUrl:r.maps_url||"",phone:r.phone||"",hours:r.hours,image:r.image_url||"",maps:r.maps_url||"",featured:r.featured,active:r.active,services:r.services||[]}));
}
export async function getMagazines():Promise<Magazine[]>{
  const rows=await publicRows<any>("site_magazines","published_at.desc");
  if(!rows?.length)return fallbackMagazines;
  return rows.map(r=>({id:r.id,title:r.title,edition:r.edition,cover:r.cover_url||"",href:r.pdf_url}));
}