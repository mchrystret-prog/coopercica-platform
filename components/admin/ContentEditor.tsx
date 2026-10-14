"use client";
import{FormEvent,useEffect,useState,type ChangeEvent}from"react";import{SUPABASE_PUBLISHABLE_KEY,SUPABASE_URL}from"@/lib/leaflets";import{LeafletMissingImages}from"./LeafletMissingImages";
import { PublicationPdfField } from "./PublicationPdfField";
import { StoreGalleryEditor } from "./StoreGalleryEditor";
import { storeGallery, validateStoreGalleries } from "@/lib/store-gallery";
import { validateCmsUploads } from "@/lib/cms-upload-validation";
type Kind="campaign"|"leaflet"|"magazine"|"store";type Data=Record<string,unknown>;
const fields:Record<Kind,Array<{name:string;label:string;type?:string}>>={campaign:[{name:"title",label:"Título"},{name:"sort_order",label:"Posição do banner",type:"number"},{name:"href",label:"Destino do banner"},{name:"background_color",label:"Cor de fundo"},{name:"starts_at",label:"Início da exibição",type:"datetime-local"},{name:"ends_at",label:"Fim da exibição",type:"datetime-local"}],magazine:[{name:"title",label:"Título"},{name:"edition",label:"Edição"},{name:"published_at",label:"Data da edição",type:"date"}],store:[{name:"store_number",label:"Número da unidade",type:"number"},{name:"name",label:"Nome"},{name:"slug",label:"Slug"},{name:"city",label:"Cidade"},{name:"neighborhood",label:"Bairro"},{name:"address",label:"Endereço"},{name:"phone",label:"Telefone"},{name:"hours",label:"Horário"},{name:"maps_url",label:"Link do Google Maps"}],leaflet:[{name:"name",label:"Nome do folheto"},{name:"display_from",label:"Exibir no site a partir de",type:"date"},{name:"starts_at",label:"Início da vigência",type:"date"},{name:"ends_at",label:"Fim da vigência",type:"date"}]};
const table:Record<Kind,string>={campaign:"site_campaigns",leaflet:"digital_leaflets",magazine:"site_magazines",store:"site_stores"};
const format=(v:unknown,type?:string)=>{if(v==null)return"";const s=String(v);return type==="datetime-local"?s.slice(0,16):s};
export function ContentEditor({kind,id,onDone}:{kind:Kind;id:string;onDone:()=>void}){const[data,setData]=useState<Data|null>(null),[msg,setMsg]=useState(""),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
const [photos,setPhotos]=useState<string[]>([]),[photosDirty,setPhotosDirty]=useState(false),[uploading,setUploading]=useState(false);
async function customization(token:string) {
  const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_get_site_customization`,{method:"POST",headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:"{}"});
  if(!r.ok)throw new Error("Não foi possível carregar as fotos da unidade.");
  return r.json() as Promise<{settings:Record<string,Record<string,string>>}>;
}
async function uploadPhotos(event:ChangeEvent<HTMLInputElement>) {
  const input=event.currentTarget,files=Array.from(input.files||[]);
  if(!files.length)return;
  if(photos.length+files.length>6){setMsg("Cada loja pode ter até 6 fotos.");input.value="";return;}
  const t=sessionStorage.getItem("coopercica_admin_token");if(!t){setMsg("Sessão expirada.");return;}
  setUploading(true);setMsg("");
  try {
    await validateCmsUploads(files.map(file=>[file,"store"]));
    const urls=await Promise.all(files.map(async file=>{
      const path=`stores/${Date.now()}-${crypto.randomUUID()}.${file.name.split(".").pop()||"webp"}`;
      const r=await fetch(`${SUPABASE_URL}/storage/v1/object/site-content/${path}`,{method:"POST",headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${t}`,"Content-Type":file.type},body:file});
      if(!r.ok)throw new Error("Não foi possível enviar as fotos.");
      return `${SUPABASE_URL}/storage/v1/object/public/site-content/${path}`;
    }));
    setPhotos(current=>[...current,...urls]);setPhotosDirty(true);setMsg("Fotos enviadas. Salve as alterações da loja para publicar.");
  }catch(error){setMsg(error instanceof Error?error.message:"Erro ao enviar fotos.");}
  finally{setUploading(false);input.value="";}
}
useEffect(()=>{const t=sessionStorage.getItem("coopercica_admin_token");if(!t)return;fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_get_content`,{method:"POST",headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify({p_kind:kind,p_id:id})}).then(async r=>{if(!r.ok)throw new Error();return r.json()}).then(async content=>{if(kind==="store"){const current=await customization(t);setPhotos(storeGallery(current.settings.store_galleries||{},String(content.slug)));setPhotosDirty(false);}setData(content);}).catch(()=>setMsg("Não foi possível carregar este conteúdo.")).finally(()=>setLoading(false))},[kind,id]);
async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!data)return;const t=sessionStorage.getItem("coopercica_admin_token");if(!t)return;if(uploading)return;setSaving(true);setMsg("");try{const fd=new FormData(e.currentTarget);const body:Data={};for(const f of fields[kind])body[f.name]=f.type==="number"?Number(fd.get(f.name)):fd.get(f.name)||null;
if(kind==="campaign"){if(!Number.isInteger(body.sort_order)||Number(body.sort_order)<1){setSaving(false);setMsg("Escolha uma posição inteira a partir de 1.");return;}body.active=fd.get("active")==="on";body.target=fd.get("target");}
if(kind==="magazine")body.active=fd.get("active")==="on";
if(kind==="store"){body.active=fd.get("active")==="on";body.featured=fd.get("featured")==="on";body.services=String(fd.get("services")||"").split(",").map(x=>x.trim()).filter(Boolean)}
if(kind==="leaflet")body.status=fd.get("status");
if(kind==="store"){const error=validateStoreGalleries({[String(data.slug)]:JSON.stringify(photos)});if(error)throw new Error(error);}
const endpoint=kind==="leaflet"?`${SUPABASE_URL}/rest/v1/rpc/cms_save_content`:`${SUPABASE_URL}/rest/v1/${table[kind]}?id=eq.${id}`;const payload=kind==="leaflet"?{p_kind:kind,p_id:id,p_data:body}:body;const r=await fetch(endpoint,{method:kind==="leaflet"?"POST":"PATCH",headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${t}`,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(payload)});if(r.ok){
if(kind==="store"&&(photosDirty||body.slug!==data.slug)){
  const current=await customization(t);
  const galleries={...current.settings.store_galleries,[String(body.slug)]:JSON.stringify(photos)};
  if(body.slug!==data.slug)galleries[String(data.slug)]="[]";
  const saved=await fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_save_site_customization`,{method:"POST",headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify({p_settings:{store_galleries:galleries},p_sections:[]})});
  if(!saved.ok)throw new Error("Os dados da loja foram salvos, mas as fotos não. Tente salvar novamente.");
  setPhotosDirty(false);
}
setData(current=>current?{...current,...body}:current);setMsg("Alterações salvas com sucesso.");setTimeout(onDone,900)}else{let detail="";try{detail=await r.text()}catch{}setMsg(`Não foi possível salvar as alterações${detail?`: ${detail}`:"."}`)}}catch(error){setMsg(error instanceof Error?error.message:"Não foi possível salvar.");}finally{setSaving(false)}}
if(loading)return <div className="cms-empty">Carregando conteúdo...</div>;if(!data)return <div className="form-status"><strong>{msg||"Conteúdo não encontrado."}</strong></div>;
return <form className="settings-form" onSubmit={submit}>{fields[kind].map(f=><label key={f.name}>{f.label}<input name={f.name} type={f.type||"text"} defaultValue={format(data[f.name],f.type)} min={kind==="campaign"&&f.name==="sort_order"?1:undefined} step={kind==="campaign"&&f.name==="sort_order"?1:undefined} required={["title","name","sort_order","store_number","city","neighborhood","address","hours","display_from","starts_at","ends_at","published_at"].includes(f.name)}/>{kind==="campaign"&&f.name==="sort_order"?<small>1 aparece primeiro. Os demais banners são reposicionados automaticamente.</small>:null}</label>)}
{kind==="campaign"?<><label>Abrir em<select name="target" defaultValue={String(data.target||"_self")}><option value="_self">Mesma aba</option><option value="_blank">Nova aba</option></select></label><label><input name="active" type="checkbox" defaultChecked={Boolean(data.active)}/> Publicada</label></>:null}
{kind==="magazine"?<label><input name="active" type="checkbox" defaultChecked={Boolean(data.active)}/> Publicada</label>:null}
{kind==="store"?<><label className="form-span-full">Serviços<input name="services" defaultValue={Array.isArray(data.services)?data.services.join(", "):""}/><small>Separe por vírgula.</small></label><label><input name="featured" type="checkbox" defaultChecked={Boolean(data.featured)}/> Unidade em destaque</label><label><input name="active" type="checkbox" defaultChecked={Boolean(data.active)}/> Publicada</label></>:null}
{kind==="leaflet"?<label>Status<select name="status" defaultValue={String(data.status||"draft")}><option value="draft">Rascunho</option><option value="published">Publicado</option></select><small>Publicado respeita a data de exibição e o fim da vigência. Imagens pendentes podem ser adicionadas abaixo.</small></label>:null}
{kind==="leaflet"||kind==="magazine"?<PublicationPdfField kind={kind} id={id} currentUrl={String(data.pdf_url||"")}/>:null}
{kind==="store"?<StoreGalleryEditor photos={photos} storeNumber={String(data.store_number)} busy={saving||uploading} onUpload={uploadPhotos} onChange={next=>{setPhotos(next);setPhotosDirty(true);}}/>:null}
<div className="form-actions"><button className="button" disabled={saving||uploading}>{saving?"Salvando...":"Salvar alterações"}</button></div>{msg?<div className="form-status" role="status"><strong>{msg}</strong></div>:null}{kind==="leaflet"?<LeafletMissingImages leafletId={id}/>:null}</form>}
