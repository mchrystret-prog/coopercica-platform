export const SUPABASE_URL = "https://pmcvhrkykezvtdzkkfpa.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_-aG-9UkJ21nWIcHzRpEheQ_9hCU29x_";

export type Leaflet = { id:string; name:string; slug:string; cover_url:string|null; starts_at:string; ends_at:string; status:"draft"|"published" };
export type LeafletProduct = { id:string; sort_order:number; ean:string|null; description:string; complement:string|null; regular_price:number; coopermais_price:number|null; unit:string|null; delivery_url:string|null; super_offer:boolean; age_18:boolean; breastfeeding_warning:boolean; image_url:string|null };

async function rest<T>(path:string):Promise<T>{
  const response=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${SUPABASE_PUBLISHABLE_KEY}`},next:{revalidate:60}});
  if(!response.ok) throw new Error("Falha ao carregar folheteria");
  return response.json();
}
export async function getActiveLeaflets(){
  const today=new Date().toISOString().slice(0,10);
  return rest<Leaflet[]>(`digital_leaflets?select=*&status=eq.published&starts_at=lte.${today}&ends_at=gte.${today}&order=ends_at.asc`);
}
export async function getLeaflet(slug:string){
  const leaflets=await rest<Leaflet[]>(`digital_leaflets?select=*&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`);
  return leaflets[0]??null;
}
export async function getLeafletProducts(id:string){
  return rest<LeafletProduct[]>(`digital_leaflet_products?select=*&leaflet_id=eq.${id}&order=sort_order.asc`);
}
