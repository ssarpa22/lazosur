"use client";

import {useCallback, useEffect, useState} from "react";

type Collection = "projects" | "services";
type ContentItem = {
  id: string; name: string; slug: string; description: string; published: boolean; sort_order: number;
  category?: string | null; image_url?: string | null; gallery?: string[]; external_url?: string | null;
  content?: string | null; meta_title?: string | null; meta_description?: string | null;
};
type FormValues = Record<string, string | boolean>;
const emptyValues = (collection: Collection): FormValues => collection === "projects"
  ? {name:"",slug:"",description:"",category:"Proyecto propio",image_url:"",gallery:"",external_url:"",published:false,sort_order:"0"}
  : {name:"",slug:"",description:"",content:"",meta_title:"",meta_description:"",published:false,sort_order:"0"};

function toValues(item: ContentItem, collection: Collection): FormValues {
  return collection === "projects"
    ? {name:item.name,slug:item.slug,description:item.description,category:item.category ?? "Proyecto propio",image_url:item.image_url ?? "",gallery:(item.gallery ?? []).join("\n"),external_url:item.external_url ?? "",published:item.published,sort_order:String(item.sort_order)}
    : {name:item.name,slug:item.slug,description:item.description,content:item.content ?? "",meta_title:item.meta_title ?? "",meta_description:item.meta_description ?? "",published:item.published,sort_order:String(item.sort_order)};
}

export function AdminContent() {
  const [collection,setCollection] = useState<Collection>("projects");
  const [items,setItems] = useState<ContentItem[]>([]);
  const [values,setValues] = useState<FormValues>(emptyValues("projects"));
  const [editing,setEditing] = useState<string | null>(null);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/content/${collection}`,{cache:"no-store"});
      const result = await response.json() as {data?:ContentItem[];error?:string};
      if(!response.ok || !result.data) throw new Error(result.error ?? "No se pudo cargar el contenido.");
      setItems(result.data);
    } catch(cause) { setError(cause instanceof Error ? cause.message : "Error al cargar."); }
    finally { setLoading(false); }
  },[collection]);

  useEffect(()=>{void load();setEditing(null);setValues(emptyValues(collection));setNotice("");},[load,collection]);

  function change(key:string,value:string|boolean) { setValues(current=>({...current,[key]:value})); }
  function edit(item:ContentItem) { setEditing(item.id);setValues(toValues(item,collection));setNotice(""); }
  function reset() { setEditing(null);setValues(emptyValues(collection));setError(""); }

  async function save(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setSaving(true);setError("");setNotice("");
    const payload:Record<string,unknown> = {...values,sort_order:Number(values.sort_order)};
    if(collection==="projects") {
      payload.gallery=String(values.gallery ?? "").split("\n").map(value=>value.trim()).filter(Boolean);
      payload.image_url=String(values.image_url ?? "").trim() || null;
      payload.external_url=String(values.external_url ?? "").trim() || null;
    } else {
      payload.content=String(values.content ?? "") || null;
      payload.meta_title=String(values.meta_title ?? "").trim() || null;
      payload.meta_description=String(values.meta_description ?? "").trim() || null;
    }
    delete payload.id;
    try {
      const response=await fetch(editing ? `/api/admin/content/${collection}/${editing}` : `/api/admin/content/${collection}`,{
        method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),
      });
      const result=await response.json() as {data?:ContentItem;error?:string};
      if(!response.ok || !result.data) throw new Error(result.error ?? "No se pudo guardar.");
      setNotice(editing?"Cambios guardados.":"Contenido creado.");
      setEditing(result.data.id);setValues(toValues(result.data,collection));await load();
    } catch(cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar."); }
    finally { setSaving(false); }
  }

  async function togglePublished(item:ContentItem) {
    setError("");setNotice("");
    try {
      const response=await fetch(`/api/admin/content/${collection}/${item.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({published:!item.published})});
      const result=await response.json() as {data?:ContentItem;error?:string};
      if(!response.ok || !result.data) throw new Error(result.error ?? "No se pudo cambiar la publicación.");
      setItems(current=>current.map(value=>value.id===item.id?result.data!:value));
      if(editing===item.id) change("published",result.data.published);
      setNotice(result.data.published?"Contenido publicado.":"Contenido despublicado.");
    } catch(cause) {setError(cause instanceof Error?cause.message:"No se pudo actualizar.");}
  }

  return <section className="content-manager" aria-label="Gestión de proyectos y servicios">
    <div className="content-tabs" role="tablist" aria-label="Tipo de contenido">
      <button type="button" role="tab" aria-selected={collection==="projects"} className={collection==="projects"?"active":""} onClick={()=>setCollection("projects")}>Proyectos</button>
      <button type="button" role="tab" aria-selected={collection==="services"} className={collection==="services"?"active":""} onClick={()=>setCollection("services")}>Servicios</button>
    </div>
    <div className="content-layout">
      <div className="content-list-panel">
        <div className="content-list-heading"><strong>{items.length} {collection==="projects"?"proyectos":"servicios"}</strong><button type="button" className="btn small" onClick={reset}>Nuevo</button></div>
        {loading?<p className="content-empty">Cargando…</p>:items.length===0?<p className="content-empty">Todavía no hay contenido.</p>:<ul className="content-list">{items.map(item=><li key={item.id}>
          <button type="button" className={editing===item.id?"selected":""} onClick={()=>edit(item)}>
            <strong>{item.name}</strong><span>{item.slug}</span><small>{item.published?"Publicado":"Borrador"}</small>
          </button>
          <button type="button" className="content-publish" onClick={()=>void togglePublished(item)} aria-label={item.published?"Despublicar":"Publicar"}>{item.published?"Despublicar":"Publicar"}</button>
        </li>)}</ul>}
      </div>
      <form className="content-form" onSubmit={save}>
        <div className="content-form-heading"><div><span className="eyebrow">{editing?"EDITAR":"NUEVO"} / {collection==="projects"?"PROYECTO":"SERVICIO"}</span><h3>{editing?"Editar contenido":"Crear contenido"}</h3></div>{editing&&<button type="button" className="content-text-button" onClick={reset}>Cancelar edición</button>}</div>
        <label>Nombre<input required minLength={2} maxLength={120} value={String(values.name??"")} onChange={e=>change("name",e.target.value)}/></label>
        <label>Slug (URL)<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} value={String(values.slug??"")} onChange={e=>change("slug",e.target.value)}/></label>
        <label>Descripción<textarea required minLength={10} maxLength={2000} rows={3} value={String(values.description??"")} onChange={e=>change("description",e.target.value)}/></label>
        {collection==="projects"?<>
          <label>Categoría<input maxLength={80} value={String(values.category??"")} onChange={e=>change("category",e.target.value)}/></label>
          <label>URL de imagen principal<input type="url" maxLength={2048} placeholder="https://" value={String(values.image_url??"")} onChange={e=>change("image_url",e.target.value)}/></label>
          <label>Galería (una URL por línea)<textarea rows={3} value={String(values.gallery??"")} onChange={e=>change("gallery",e.target.value)}/></label>
          <label>URL externa<input type="url" maxLength={2048} placeholder="https://" value={String(values.external_url??"")} onChange={e=>change("external_url",e.target.value)}/></label>
        </>:<>
          <label>Contenido ampliado<textarea rows={5} maxLength={12000} value={String(values.content??"")} onChange={e=>change("content",e.target.value)}/></label>
          <label>Meta title (máx. 70)<input maxLength={70} value={String(values.meta_title??"")} onChange={e=>change("meta_title",e.target.value)}/></label>
          <label>Meta description (máx. 170)<textarea rows={2} maxLength={170} value={String(values.meta_description??"")} onChange={e=>change("meta_description",e.target.value)}/></label>
        </>}
        <label>Orden<input type="number" min={0} max={10000} value={String(values.sort_order??"0")} onChange={e=>change("sort_order",e.target.value)}/></label>
        <label className="content-checkbox"><input type="checkbox" checked={Boolean(values.published)} onChange={e=>change("published",e.target.checked)}/> Publicado en el sitio</label>
        {error&&<p className="leads-error" role="alert">{error}</p>}{notice&&<p className="content-notice" role="status">{notice}</p>}
        <div className="content-form-actions"><button className="btn small" type="submit" disabled={saving}>{saving?"Guardando…":editing?"Guardar cambios":"Crear contenido"}</button>{editing&&<button className="content-text-button" type="button" onClick={reset}>Crear otro</button>}</div>
      </form>
    </div>
  </section>;
}
