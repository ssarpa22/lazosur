"use client";

import {useCallback, useEffect, useState} from "react";

type LeadStatus = "new" | "contacted" | "negotiation" | "won" | "lost" | "archived";
type Lead = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  service: string;
  budget: string | null;
  message: string;
  status: LeadStatus;
  source: string;
  consent_at: string;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

type LeadSummary = Pick<Lead, "id" | "name" | "company" | "email" | "status" | "created_at">;
type ListResponse = {data: LeadSummary[]; total: number; page: number; pageSize: number};
const statusLabels: Record<LeadStatus, string> = {
  new: "Nueva",
  contacted: "En contacto",
  negotiation: "Negociación",
  won: "Ganada",
  lost: "Perdida",
  archived: "Archivada",
};
const serviceLabels: Record<string, string> = {
  web: "Diseño y desarrollo web",
  seo: "SEO",
  both: "Web + SEO",
  other: "Otro",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {dateStyle: "medium", timeStyle: "short"}).format(new Date(value));
}

export function AdminLeads() {
  const [items, setItems] = useState<LeadSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadLeads = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({page: String(page), status, q: search});
    try {
      const response = await fetch(`/api/admin/leads?${params}`, {cache: "no-store", signal});
      const result = await response.json() as ListResponse & {error?: string};
      if (!response.ok) throw new Error(result.error ?? "No se pudieron cargar las consultas.");
      setItems(result.data);
      setTotal(result.total);
      setPageSize(result.pageSize);
      if (selectedId && !result.data.some((lead) => lead.id === selectedId) && page === 1) {
        setSelectedId(null);
        setSelected(null);
      }
    } catch (cause) {
      if (cause instanceof Error && cause.name !== "AbortError") setError(cause.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, status, search, selectedId]);

  useEffect(() => {
    const controller = new AbortController();
    void loadLeads(controller.signal);
    return () => controller.abort();
  }, [loadLeads]);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      return;
    }
    const controller = new AbortController();
    setDetailLoading(true);
    fetch(`/api/admin/leads/${selectedId}`, {cache: "no-store", signal: controller.signal})
      .then(async (response) => {
        const result = await response.json() as {data?: Lead; error?: string};
        if (!response.ok || !result.data) throw new Error(result.error ?? "No se pudo cargar el detalle.");
        setSelected(result.data);
      })
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name !== "AbortError") setError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false);
      });
    return () => controller.abort();
  }, [selectedId]);

  async function updateStatus(nextStatus: LeadStatus) {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/leads/${selected.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({status: nextStatus}),
      });
      const result = await response.json() as {data?: Lead; error?: string};
      if (!response.ok || !result.data) throw new Error(result.error ?? "No se pudo actualizar el estado.");
      const updatedLead = result.data;
      setSelected(updatedLead);
      setItems((current) => current.map((lead) => lead.id === updatedLead.id ? {...lead, status: updatedLead.status} : lead));
      if (status !== "all" && status !== nextStatus) {
        setItems((current) => current.filter((lead) => lead.id !== updatedLead.id));
        setTotal((current) => Math.max(0, current - 1));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar el estado.");
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="leads-manager" aria-label="Gestión de consultas">
      <div className="leads-toolbar">
        <form className="leads-search" onSubmit={(event) => {event.preventDefault(); setPage(1); setSearch(searchInput.trim());}}>
          <label htmlFor="lead-search">Buscar por nombre, correo o empresa</label>
          <div className="leads-search-row">
            <input id="lead-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} maxLength={80} placeholder="Ej. contacto@empresa.com"/>
            <button className="btn small" type="submit">Buscar</button>
          </div>
        </form>
        <label className="leads-filter">Estado
          <select value={status} onChange={(event) => {setStatus(event.target.value); setPage(1);}}>
            <option value="all">Todos</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>

      {error && <p className="leads-error" role="alert">{error}</p>}

      <div className="leads-layout">
        <div className="leads-list-panel">
          <div className="leads-list-heading"><strong>{total} consultas</strong><span>Ordenadas de más recientes a más antiguas</span></div>
          {loading ? <p className="leads-empty">Cargando consultas…</p> : items.length === 0 ? <p className="leads-empty">No hay consultas que coincidan con estos filtros.</p> : (
            <ul className="leads-list">
              {items.map((lead) => (
                <li key={lead.id}>
                  <button type="button" className={`lead-list-item ${selectedId === lead.id ? "selected" : ""}`} onClick={() => setSelectedId(lead.id)}>
                    <span className="lead-list-top"><strong>{lead.name}</strong><small>{statusLabels[lead.status]}</small></span>
                    <span>{lead.company || lead.email}</span>
                    <time dateTime={lead.created_at}>{formatDate(lead.created_at)}</time>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="leads-pagination">
            <button type="button" className="btn small" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button type="button" className="btn small" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>Siguiente</button>
          </div>
        </div>

        <div className="lead-detail-panel">
          {!selectedId ? <p className="leads-empty">Seleccioná una consulta para ver todos sus datos.</p> : detailLoading || !selected ? <p className="leads-empty">Cargando detalle…</p> : (
            <>
              <div className="lead-detail-heading"><div><span className="eyebrow">DETALLE DE CONSULTA</span><h2>{selected.name}</h2></div><span className="lead-status">{statusLabels[selected.status]}</span></div>
              <dl className="lead-detail-grid">
                <div><dt>Correo</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div>
                <div><dt>Teléfono</dt><dd>{selected.phone || "No informado"}</dd></div>
                <div><dt>Empresa</dt><dd>{selected.company || "No informada"}</dd></div>
                <div><dt>Servicio</dt><dd>{serviceLabels[selected.service] ?? selected.service}</dd></div>
                <div><dt>Presupuesto</dt><dd>{selected.budget || "No informado"}</dd></div>
                <div><dt>Origen</dt><dd>{selected.source}</dd></div>
                <div><dt>Recibida</dt><dd>{formatDate(selected.created_at)}</dd></div>
                <div><dt>Consentimiento</dt><dd>{formatDate(selected.consent_at)}</dd></div>
              </dl>
              <div className="lead-message"><h3>Mensaje</h3><p>{selected.message}</p></div>
              {selected.internal_notes && <div className="lead-message"><h3>Notas internas</h3><p>{selected.internal_notes}</p></div>}
              <label className="lead-status-control">Actualizar estado
                <select value={selected.status} disabled={saving} onChange={(event) => void updateStatus(event.target.value as LeadStatus)}>
                  {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <p className="lead-updated">Última actualización: {formatDate(selected.updated_at)}</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
