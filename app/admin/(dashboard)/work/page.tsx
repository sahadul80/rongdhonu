"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import { useEffect, useMemo, useState } from "react";
import { Briefcase, Plus, Save, Search, Trash2, X } from "lucide-react";
import ImageUploadInput from "../ImageUploadInput";
import SuggestionInput from "../SuggestionInput";
import { validateWorkForm, type WorkFormValue } from "@/lib/formValidation";
import AdminActionButton from "../AdminActionButton";
import AdminActionFeedback from "../AdminActionFeedback";
import AdminPageHeader from "../AdminPageHeader";
import { slugify } from "@/lib/slug";

interface WorkRow { id:number; slug:string; title:string; title_bn:string|null; category:string; category_bn:string|null; description:string; description_bn:string|null; client_name:string|null; location:string|null; year:number|null; image_url:string|null; sort_order:number; active:boolean; }
const BLANK: WorkFormValue = { slug:"", title:"", titleBn:"", category:"", categoryBn:"", description:"", descriptionBn:"", clientName:"", location:"", year:"", imageUrl:null };

export default function WorkEditorPage() {
  const [work,setWork]=useState<WorkRow[]>([]); const [draft,setDraft]=useState(BLANK); const [creating,setCreating]=useState(false); const [loading,setLoading]=useState(true); const [message,setMessage]=useState<{ok:boolean;text:string}|null>(null); const [deleting,setDeleting]=useState<number|null>(null); const [actionKey,setActionKey]=useState<string|null>(null); const [search,setSearch]=useState(""); const [visibility,setVisibility]=useState<"all"|"visible"|"hidden">("all"); const [categoryFilter,setCategoryFilter]=useState("all");
  async function load(silent = false){
    if (!silent) setActionKey("load");
    setLoading(true);
    try { const r=await fetch("/api/admin/work",{cache:"no-store"}); const d=await r.json().catch(()=>({})); if(!r.ok)throw new Error(d.error||"Could not load work."); setWork(Array.isArray(d.work)?d.work:[]); }
    catch(e){setMessage({ok:false,text:e instanceof Error?e.message:"Could not load work."});}
    finally {setLoading(false); if(!silent) setActionKey(null);}
  }
  useEffect(()=>{void load();},[]);
  async function create(e:React.FormEvent){
    e.preventDefault();
    const prepared={...draft,slug:draft.slug||slugify(draft.title,"our-work-item")};
    const v=validateWorkForm(prepared);
    if(!v.ok){setMessage({ok:false,text:v.message});return;}
    setActionKey("create"); setMessage(null);
    try {
      const r=await fetch("/api/admin/work",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(prepared)});
      const d=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(d.error||"Could not add work.");
      setDraft(BLANK); setCreating(false); setMessage({ok:true,text:"Work item added successfully."}); await load(true);
    } catch(e) { setMessage({ok:false,text:e instanceof Error?e.message:"Could not add work."}); }
    finally { setActionKey(null); }
  }
  async function save(item:WorkRow){
    const form:WorkFormValue={slug:item.slug,title:item.title,titleBn:item.title_bn||"",category:item.category,categoryBn:item.category_bn||"",description:item.description,descriptionBn:item.description_bn||"",clientName:item.client_name||"",location:item.location||"",year:item.year?String(item.year):"",imageUrl:item.image_url};
    const v=validateWorkForm(form);
    if(!v.ok){setMessage({ok:false,text:v.message});return;}
    const key=`save:${item.id}`; setActionKey(key); setMessage(null);
    try {
      const r=await fetch(`/api/admin/work/${item.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,active:item.active,sortOrder:item.sort_order})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok){await load(true); throw new Error(d.error||"Could not save work.");}
      setMessage({ok:true,text:`“${item.title||"Work item"}” saved successfully.`});
    } catch(e) { setMessage({ok:false,text:e instanceof Error?e.message:"Could not save work."}); }
    finally { setActionKey(null); }
  }
  async function remove(id:number){
    const item=work.find((entry)=>entry.id===id);
    const key=`delete:${id}`; setActionKey(key); setMessage(null);
    try {
      const r=await fetch(`/api/admin/work/${id}`,{method:"DELETE"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(d.error||"Could not remove work.");
      setWork(x=>x.filter(i=>i.id!==id)); setDeleting(null); setMessage({ok:true,text:`“${item?.title||"Work item"}” removed successfully.`});
    } catch(e) { setMessage({ok:false,text:e instanceof Error?e.message:"Could not remove work."}); }
    finally { setActionKey(null); }
  }
  const categories = useMemo(() => Array.from(new Set(work.map((item) => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [work]);
  const filteredWork = useMemo(() => work.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [item.title, item.slug, item.category, item.client_name ?? "", item.location ?? ""].some((value) => value.toLowerCase().includes(q));
    const matchesVisibility = visibility === "all" || (visibility === "visible" ? item.active : !item.active);
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesVisibility && matchesCategory;
  }), [work, search, visibility, categoryFilter]);

  if(loading)return <AdminLoadingSkeleton title="Loading work" variant="editor" rows={6}/>;
  return (
    <div className="admin-page">
      <AdminPageHeader
        hasSearch
        icon={<Briefcase className="h-4 w-4" />}
        title="Our Work"
        subtitle="Manage portfolio entries, visibility, ordering and related reviews."
        actions={
          <AdminActionButton type="button" onClick={()=>setCreating(x=>!x)} className="admin-action bg-primary text-primary-foreground hover:bg-primary-600" icon={creating?<X className="h-4 w-4"/>:<Plus className="h-4 w-4"/>}>{creating?"Close form":"Add work"}</AdminActionButton>
        }
      >
        <div className="admin-toolbar-search"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden="true"/><input className="admin-input" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search title, slug, category, client or location…" aria-label="Search work"/></div>
        <select className="admin-select admin-toolbar-filter" value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)} aria-label="Filter work category"><option value="all">All categories</option>{categories.map((category)=><option key={category} value={category}>{category}</option>)}</select>
        <select className="admin-select admin-toolbar-filter" value={visibility} onChange={(e)=>setVisibility(e.target.value as typeof visibility)} aria-label="Filter work visibility"><option value="all">All visibility</option><option value="visible">Visible</option><option value="hidden">Hidden</option></select>
        <span className="admin-toolbar-meta">{filteredWork.length} / {work.length}</span>
      </AdminPageHeader>
      <div className="admin-sticky-feedback"><AdminActionFeedback message={message} /></div>
      
      {creating&&
      <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
        <form onSubmit={create} className="admin-panel p-3 sm:p-4"><WorkFields value={draft} onChange={setDraft}/><AdminActionButton className="admin-action mt-3 bg-primary text-primary-foreground" type="submit" loading={actionKey === "create"} loadingLabel="Adding…" icon={<Plus className="h-4 w-4"/>}>Add work</AdminActionButton></form>
      </div>}

      <div className="admin-panel flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-foreground">Saved work</h2><p className="text-[10px] text-muted">{filteredWork.length} shown of {work.length} records</p>
        </div>
        <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
          {filteredWork.length?filteredWork.map(item=>
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
                  <AdminActionButton type="button" onClick={()=>void remove(item.id)} loading={actionKey === `delete:${item.id}`} loadingLabel="Removing…" className="rounded-md bg-rd-red px-2 py-1 text-white">Remove</AdminActionButton>
                  <button type="button" onClick={()=>setDeleting(null)} className="rounded-md border border-border bg-background px-2 py-1 text-muted-strong">Cancel</button>
                </div> : 
                <button type="button" onClick={()=>setDeleting(item.id)} className="admin-action border border-border text-muted-strong hover:text-rd-red"><Trash2 className="h-4 w-4"/>Delete</button>}
                <AdminActionButton type="button" onClick={()=>void save(item)} loading={actionKey === `save:${item.id}`} loadingLabel="Saving…" icon={<Save className="h-4 w-4"/>} className="admin-action bg-primary text-primary-foreground">Save changes</AdminActionButton>
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

function WorkFields({value,onChange}:{value:WorkFormValue;onChange:(v:WorkFormValue)=>void}){return <div className="grid gap-3 sm:grid-cols-2"><Field label="Dynamic slug" value={value.slug} onChange={slug=>onChange({...value,slug})}/><Field label="Title" value={value.title} onChange={title=>onChange({...value,title})}/><Field label="Title in Bangla" value={value.titleBn} onChange={titleBn=>onChange({...value,titleBn})}/><SuggestionInput label="Category" value={value.category} collection="work" field="category" onChange={category=>onChange({...value,category})}/><SuggestionInput label="Category in Bangla" value={value.categoryBn} collection="work" field="categoryBn" onChange={categoryBn=>onChange({...value,categoryBn})}/><SuggestionInput label="Client name" value={value.clientName} collection="work" field="clientName" onChange={clientName=>onChange({...value,clientName})}/><SuggestionInput label="Location" value={value.location} collection="work" field="location" onChange={location=>onChange({...value,location})}/><Field label="Year" value={value.year} onChange={year=>onChange({...value,year})}/><div className="sm:col-span-2"><Field label="Description" value={value.description} onChange={description=>onChange({...value,description})} area/></div><div className="sm:col-span-2"><Field label="Description in Bangla" value={value.descriptionBn} onChange={descriptionBn=>onChange({...value,descriptionBn})} area/></div><div className="sm:col-span-2"><ImageUploadInput label="Work image" value={value.imageUrl} onChange={imageUrl=>onChange({...value,imageUrl})}/></div></div>}
function Field({label,value,onChange,area}:{label:string;value:string;onChange:(v:string)=>void;area?:boolean}){return <label className="admin-label"><span>{label}</span>{area?<textarea className="admin-textarea" rows={3} value={value} onChange={e=>onChange(e.target.value)}/>:<input className="admin-input" value={value} onChange={e=>onChange(e.target.value)}/>}</label>}
