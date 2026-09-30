"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import { useEffect, useState } from "react";
import { Briefcase, Plus, Save, Trash2, X } from "lucide-react";
import ImageUploadInput from "../ImageUploadInput";
import { validateWorkForm, type WorkFormValue } from "@/lib/formValidation";

interface WorkRow { id:number; slug:string; title:string; title_bn:string|null; category:string; category_bn:string|null; description:string; description_bn:string|null; client_name:string|null; location:string|null; year:number|null; image_url:string|null; sort_order:number; active:boolean; }
const BLANK: WorkFormValue = { slug:"our-work-item", title:"", titleBn:"", category:"", categoryBn:"", description:"", descriptionBn:"", clientName:"", location:"", year:"", imageUrl:null };

export default function WorkEditorPage() {
  const [work,setWork]=useState<WorkRow[]>([]); const [draft,setDraft]=useState(BLANK); const [creating,setCreating]=useState(false); const [loading,setLoading]=useState(true); const [message,setMessage]=useState<{ok:boolean;text:string}|null>(null); const [deleting,setDeleting]=useState<number|null>(null);
  async function load(){setLoading(true);try{const r=await fetch("/api/admin/work");const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Could not load work.");setWork(Array.isArray(d.work)?d.work:[]);}catch(e){setMessage({ok:false,text:e instanceof Error?e.message:"Could not load work."});}finally{setLoading(false);}}
  useEffect(()=>{void load();},[]);
  async function create(e:React.FormEvent){e.preventDefault();const v=validateWorkForm(draft);if(!v.ok)return setMessage({ok:false,text:v.message});const r=await fetch("/api/admin/work",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(draft)});const d=await r.json().catch(()=>({}));if(!r.ok)return setMessage({ok:false,text:d.error||"Could not add work."});setDraft(BLANK);setCreating(false);setMessage({ok:true,text:"Work item added."});void load();}
  async function save(item:WorkRow){const form:WorkFormValue={slug:item.slug,title:item.title,titleBn:item.title_bn||"",category:item.category,categoryBn:item.category_bn||"",description:item.description,descriptionBn:item.description_bn||"",clientName:item.client_name||"",location:item.location||"",year:item.year?String(item.year):"",imageUrl:item.image_url};const v=validateWorkForm(form);if(!v.ok)return setMessage({ok:false,text:v.message});const r=await fetch(`/api/admin/work/${item.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,active:item.active,sortOrder:item.sort_order})});const d=await r.json().catch(()=>({}));setMessage(r.ok?{ok:true,text:"Work saved."}:{ok:false,text:d.error||"Could not save work."});if(!r.ok)void load();}
  async function remove(id:number){const r=await fetch(`/api/admin/work/${id}`,{method:"DELETE"});if(r.ok){setWork(x=>x.filter(i=>i.id!==id));setDeleting(null);setMessage({ok:true,text:"Work removed."});}}
  if(loading)return <AdminLoadingSkeleton title="Loading work" variant="editor" rows={6}/>;
  return (
    <div className="admin-page h-full min-h-0 overflow-hidden">
      <div className="flex flex-row items-center justify-between">
        <div className="min-w-0">
          <span className="flex flex-row items-center gap-2"><Briefcase className="h-auto w-auto text-primary" aria-hidden="true" /><p className="admin-page-title">Our Work</p></span>
          <p className="admin-page-subtitle sm:inline hidden">Portfolio entries are database-driven and open in a modal on the public website, with related client reviews.</p>
        </div>
        <div>
          <button type="button" onClick={()=>setCreating(x=>!x)} className="admin-action bg-primary text-primary-foreground hover:bg-primary-600 disabled:opacity-60">{creating?<X className="h-4 w-4"/>:<Plus className="h-4 w-4"/>}{creating?"Cancel":"Add"}</button>
        </div>
      </div>
      
      {message&&<p role={message.ok?"status":"alert"} className={`rounded-lg px-3 py-2 text-xs font-semibold ${message.ok?"bg-rd-green/10 text-rd-green":"bg-rd-red/10 text-rd-red"}`}>{message.text}</p>}
      
      {creating&&
      <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
        <form onSubmit={create} className="admin-panel p-3 sm:p-4"><WorkFields value={draft} onChange={setDraft}/><button className="admin-action mt-3 bg-primary text-primary-foreground" type="submit"><Plus className="h-4 w-4"/>Add work</button></form>
      </div>}

      <div className="admin-panel flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-foreground">Saved work</h2><p className="text-[10px] text-muted">{work.length} record{work.length===1?"":"s"}</p>
        </div>
        <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
          {work.length?work.map(item=>
            <article key={item.id} className="rounded-xl border border-border bg-background p-3">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_13rem]"><WorkFields value={{slug:item.slug,title:item.title,titleBn:item.title_bn||"",category:item.category,categoryBn:item.category_bn||"",description:item.description,descriptionBn:item.description_bn||"",clientName:item.client_name||"",location:item.location||"",year:item.year?String(item.year):"",imageUrl:item.image_url}} onChange={v=>setWork(x=>x.map(i=>i.id===item.id?{...i,slug:v.slug,title:v.title,title_bn:v.titleBn||null,category:v.category,category_bn:v.categoryBn||null,description:v.description,description_bn:v.descriptionBn||null,client_name:v.clientName||null,location:v.location||null,year:v.year?Number(v.year):null,image_url:v.imageUrl}:i))}/>
                <div className="rounded-xl border border-border bg-surface p-3">
                  <label className="admin-label">
                    <span>Visibility</span>
                    <button type="button" onClick={()=>setWork(x=>x.map(i=>i.id===item.id?{...i,active:!i.active}:i))} className={`admin-status min-h-10 justify-center rounded-lg border ${item.active?"border-rd-green/25 bg-rd-green/10 text-rd-green":"border-border bg-surface-2 text-muted"}`}>{item.active?"Visible":"Hidden"}</button>
                  </label>
                  <label className="admin-label mt-2">
                    <span>Display order</span>
                    <input className="admin-input" inputMode="numeric" value={String(item.sort_order)} onChange={e=>setWork(x=>x.map(i=>i.id===item.id?{...i,sort_order:Number.isFinite(Number(e.target.value))?Math.max(0,Math.min(9999,Math.trunc(Number(e.target.value)))):0}:i))}/>
                  </label>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-border pt-2">{deleting===item.id?
                <div className="flex items-center gap-2 rounded-lg bg-rd-red/10 px-2.5 py-1.5 text-[10px] font-semibold text-rd-red">
                  <span>Remove this work?</span>
                  <button type="button" onClick={()=>void remove(item.id)} className="rounded-md bg-rd-red px-2 py-1 text-white">Remove</button>
                  <button type="button" onClick={()=>setDeleting(null)} className="rounded-md border border-border bg-background px-2 py-1 text-muted-strong">Cancel</button>
                </div> : 
                <button type="button" onClick={()=>setDeleting(item.id)} className="admin-action border border-border text-muted-strong hover:text-rd-red"><Trash2 className="h-4 w-4"/>Delete</button>}
                <button type="button" onClick={()=>void save(item)} className="admin-action bg-primary text-primary-foreground"><Save className="h-4 w-4"/>Save changes</button>
              </div>
            </article>) : 
          <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-border bg-surface p-5 text-center text-xs text-muted">
            No work published yet. Add a real project from the CMS.
          </div>}
        </div>
      </div>
    </div>
  )
}

function WorkFields({value,onChange}:{value:WorkFormValue;onChange:(v:WorkFormValue)=>void}){return <div className="grid gap-3 sm:grid-cols-2"><Field label="Dynamic slug" value={value.slug} onChange={slug=>onChange({...value,slug})}/><Field label="Title" value={value.title} onChange={title=>onChange({...value,title})}/><Field label="Title in Bangla" value={value.titleBn} onChange={titleBn=>onChange({...value,titleBn})}/><Field label="Category" value={value.category} onChange={category=>onChange({...value,category})}/><Field label="Category in Bangla" value={value.categoryBn} onChange={categoryBn=>onChange({...value,categoryBn})}/><Field label="Client name" value={value.clientName} onChange={clientName=>onChange({...value,clientName})}/><Field label="Location" value={value.location} onChange={location=>onChange({...value,location})}/><Field label="Year" value={value.year} onChange={year=>onChange({...value,year})}/><div className="sm:col-span-2"><Field label="Description" value={value.description} onChange={description=>onChange({...value,description})} area/></div><div className="sm:col-span-2"><Field label="Description in Bangla" value={value.descriptionBn} onChange={descriptionBn=>onChange({...value,descriptionBn})} area/></div><div className="sm:col-span-2"><ImageUploadInput label="Work image" value={value.imageUrl} onChange={imageUrl=>onChange({...value,imageUrl})}/></div></div>}
function Field({label,value,onChange,area}:{label:string;value:string;onChange:(v:string)=>void;area?:boolean}){return <label className="admin-label"><span>{label}</span>{area?<textarea className="admin-textarea" rows={3} value={value} onChange={e=>onChange(e.target.value)}/>:<input className="admin-input" value={value} onChange={e=>onChange(e.target.value)}/>}</label>}
