"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SlidersHorizontal, Users, Upload, Plus } from "lucide-react";

import ContactsHeader from "@/components/dashboard/contacts/ContactsHeader";
import ContactsKPIs from "@/components/dashboard/contacts/ContactsKPIs";
import PipelineOverview from "@/components/dashboard/contacts/PipelineOverview";
import SearchBar from "@/components/dashboard/contacts/SearchBar";
import FilterSidebar from "@/components/dashboard/contacts/FilterSidebar";
import ContactsTable, { QuickAction } from "@/components/dashboard/contacts/ContactsTable";
import BulkActionBar, { BulkAction } from "@/components/dashboard/contacts/BulkActionBar";
import ContactDrawer from "@/components/dashboard/contacts/ContactDrawer";
import AddContactModal, { ContactFormData } from "@/components/dashboard/contacts/AddContactModal";

import { CRMContact, ContactKPI, PipelineStage, ContactFilters, EMPTY_FILTERS } from "@/types/contacts-crm";
import { mockContactsData } from "@/utils/mockContacts";
import {
  getCRMContacts,
  getContactKPIs,
  getContactPipeline,
  createContactApi,
  updateContactApi,
  deleteContactApi,
  importContactsApi,
} from "@/services/contacts-crm-service";

type MultiGroup = "statuses" | "scoreRanges" | "industries" | "tags";

// ── Filtering helpers ──────────────────────────────────────────────────
function scoreInRanges(score: number, ranges: string[]) {
  if (!ranges.length) return true;
  return ranges.some((r) => {
    const [min, max] = r.split("-").map(Number);
    return score >= min && score <= max;
  });
}

function inLastContacted(iso: string | null, key: string) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  const now = Date.now();
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const startTodayMs = startToday.getTime();
  switch (key) {
    case "today":
      return t >= startTodayMs;
    case "yesterday":
      return t >= startTodayMs - 864e5 && t < startTodayMs;
    case "7d":
      return t >= now - 7 * 864e5;
    case "30d":
      return t >= now - 30 * 864e5;
    default:
      return true;
  }
}

// Lightweight natural-language search → list of AND predicates.
function buildSearchPredicates(query: string): ((c: CRMContact) => boolean)[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const preds: ((c: CRMContact) => boolean)[] = [];

  const above = q.match(/(?:above|over|greater than|more than|>)\s*(\d{1,3})/);
  if (above) {
    const n = +above[1];
    preds.push((c) => c.leadScore > n);
  }
  const below = q.match(/(?:below|under|less than|<)\s*(\d{1,3})/);
  if (below) {
    const n = +below[1];
    preds.push((c) => c.leadScore < n);
  }

  if (/not\s+(called|contacted).*(week|7 days|recently)|not\s+called\s+this\s+week/.test(q)) {
    preds.push((c) => !c.lastContact || Date.now() - new Date(c.lastContact).getTime() > 7 * 864e5);
  }

  const industries: [RegExp, string][] = [
    [/hospital|healthcare|clinic|medical/, "Healthcare"],
    [/real estate|realty|property/, "Real Estate"],
    [/education|school|academy|enroll/, "Education"],
    [/retail|store|shop/, "Retail"],
    [/manufactur|factory|industrial/, "Manufacturing"],
  ];
  industries.forEach(([re, val]) => {
    if (re.test(q)) preds.push((c) => c.industry === val);
  });

  const statuses: [RegExp, CRMContact["status"]][] = [
    [/\bbooked\b|appointment/, "booked"],
    [/\bwon\b|customer/, "won"],
    [/\bqualified\b/, "qualified"],
    [/\binterested\b/, "interested"],
    [/\bcontacted\b/, "contacted"],
    [/\blost\b/, "lost"],
    [/\bnew\b/, "new"],
  ];
  statuses.forEach(([re, val]) => {
    if (re.test(q)) preds.push((c) => c.status === val);
  });

  const tags = ["vip", "cold lead", "hot lead", "returning", "enterprise"];
  tags.forEach((tag) => {
    if (q.includes(tag)) preds.push((c) => c.tags.some((t) => t.toLowerCase() === tag));
  });

  // Fallback to substring match when no structured intent detected.
  if (preds.length === 0) {
    preds.push((c) =>
      [c.name, c.company, c.email, c.industry, c.assignedAgent, ...c.tags].join(" ").toLowerCase().includes(q)
    );
  }
  return preds;
}

export default function ContactsPageClient() {
  // Static UI config only (the filter dropdown option lists) — not business data.
  const filterConfig = mockContactsData.filterConfig;
  // Real data only. Starts empty and is populated from the backend; we never
  // seed the table with mock contacts, so what you see is what's in your DB and
  // what the campaign builder will call.
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [kpis, setKpis] = useState<ContactKPI[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [filters, setFilters] = useState<ContactFilters>(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerContact, setDrawerContact] = useState<CRMContact | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<CRMContact | null>(null);
  // True once the CRM API answers. create/edit/delete persist to the backend.
  const [backendLive, setBackendLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pull the real CRM data. What's shown here is exactly what's in the database
  // and what the campaign builder loads from /contact.
  const refreshContacts = useCallback(async () => {
    const [c, k, p] = await Promise.all([getCRMContacts(), getContactKPIs(), getContactPipeline()]);
    if (Array.isArray(c)) setContacts(c);
    if (Array.isArray(k)) setKpis(k);
    if (Array.isArray(p)) setPipeline(p);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshContacts();
        if (!cancelled) {
          setBackendLive(true);
          setLoadError(false);
        }
      } catch {
        // No mock fallback: surface the failure so a missing migration / down
        // API is visible instead of hidden behind fake contacts.
        if (!cancelled) {
          setBackendLive(false);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshContacts]);

  const activeStage = filters.statuses.length === 1 ? filters.statuses[0] : null;

  const filtered = useMemo(() => {
    const searchPreds = buildSearchPredicates(filters.search);
    return contacts.filter((c) => {
      if (filters.statuses.length && !filters.statuses.includes(c.status)) return false;
      if (!scoreInRanges(c.leadScore, filters.scoreRanges)) return false;
      if (filters.industries.length && !filters.industries.includes(c.industry)) return false;
      if (filters.tags.length && !filters.tags.some((t) => c.tags.includes(t))) return false;
      if (filters.lastContacted && !inLastContacted(c.lastContact, filters.lastContacted)) return false;
      if (searchPreds.length && !searchPreds.every((p) => p(c))) return false;
      return true;
    });
  }, [contacts, filters]);

  // Keep selection within the visible set.
  const visibleSelected = selectedIds.filter((id) => filtered.some((c) => c.id === id));

  // ── Filter mutations ────────────────────────────────────────────────
  const toggleMulti = (group: MultiGroup, id: string) =>
    setFilters((f) => {
      const arr = f[group];
      return { ...f, [group]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] };
    });
  const setLastContacted = (id: string | null) => setFilters((f) => ({ ...f, lastContacted: id }));
  const clearAll = () => setFilters(EMPTY_FILTERS);
  const setSearch = (search: string) => setFilters((f) => ({ ...f, search }));
  const selectStage = (stage: string) =>
    setFilters((f) => ({ ...f, statuses: f.statuses.length === 1 && f.statuses[0] === stage ? [] : [stage] }));

  // ── Selection ───────────────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const toggleSelectAll = () =>
    setSelectedIds((ids) => (ids.length === filtered.length ? [] : filtered.map((c) => c.id)));
  const clearSelection = () => setSelectedIds([]);

  // ── Actions ─────────────────────────────────────────────────────────
  const handleQuickAction = (action: QuickAction, contact: CRMContact) => {
    switch (action) {
      case "call":
        toast.success(`Calling ${contact.name}…`);
        break;
      case "schedule":
        toast(`Schedule a call with ${contact.name}`);
        break;
      case "view":
        setDrawerContact(contact);
        break;
      case "edit":
        setEditingContact(contact);
        setModalOpen(true);
        break;
      case "delete":
        toast(`Delete ${contact.name}?`, {
          description: "This cannot be undone.",
          action: {
            label: "Delete",
            onClick: () => {
              setContacts((cs) => cs.filter((c) => c.id !== contact.id));
              setSelectedIds((ids) => ids.filter((x) => x !== contact.id));
              toast.success(`${contact.name} deleted`);
              if (backendLive) deleteContactApi(contact.id).catch(() => {});
            },
          },
          cancel: { label: "Cancel", onClick: () => {} },
        });
        break;
    }
  };

  const handleBulkAction = (action: BulkAction) => {
    const n = visibleSelected.length;
    switch (action) {
      case "campaign":
        toast.success(`Assigned ${n} contacts to a campaign`);
        break;
      case "agent":
        toast.success(`Assigned an AI agent to ${n} contacts`);
        break;
      case "export":
        toast.success(`Exporting ${n} contacts…`);
        break;
      case "tags":
        toast(`Add tags to ${n} contacts`);
        break;
      case "schedule":
        toast.success(`Scheduled calls for ${n} contacts`);
        break;
      case "delete":
        if (backendLive) visibleSelected.forEach((id) => deleteContactApi(id).catch(() => {}));
        setContacts((cs) => cs.filter((c) => !visibleSelected.includes(c.id)));
        clearSelection();
        toast.success(`Deleted ${n} contacts`);
        break;
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    const toastId = toast.loading(`Importing ${file.name}…`);
    try {
      const res = await importContactsApi(file);
      await refreshContacts();
      toast.success(`Imported ${res.imported} contact${res.imported === 1 ? "" : "s"}`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "CSV import failed. Check the file format.", { id: toastId });
    }
  };

  const openAddModal = () => {
    setEditingContact(null);
    setModalOpen(true);
  };

  const handleSaveContact = async (form: ContactFormData) => {
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingContact) {
      // Optimistic update, then persist if the backend is live.
      setContacts((cs) =>
        cs.map((c) =>
          c.id === editingContact.id
            ? {
                ...c,
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                company: form.company.trim(),
                industry: form.industry || c.industry,
                status: (form.status as CRMContact["status"]) || c.status,
                leadScore: form.leadScore,
                tags,
              }
            : c
        )
      );
      toast.success("Contact updated");
      if (backendLive) {
        try {
          await updateContactApi(editingContact.id, {
            name: form.name.trim(),
            phone_number: form.phone.trim(),
            email: form.email.trim() || undefined,
            company: form.company.trim() || undefined,
            tags: tags.join(", ") || undefined,
            industry: form.industry || undefined,
            lead_score: form.leadScore,
            pipeline_stage: form.status,
          });
        } catch (err: any) {
          toast.error(err?.response?.data?.detail || "Couldn't save changes to the server.");
        }
      }
    } else {
      const localId = (typeof crypto !== "undefined" && crypto.randomUUID?.()) || `c-${Date.now()}`;
      const newContact: CRMContact = {
        id: localId,
        name: form.name.trim(),
        company: form.company.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        industry: form.industry || "—",
        leadScore: form.leadScore,
        status: (form.status as CRMContact["status"]) || "new",
        lastContact: null,
        assignedAgent: "Unassigned",
        nextAction: "First call",
        tags,
        assignedCampaign: "Unassigned",
        lastCallSummary: "No calls yet.",
        sentiment: "Neutral",
        nextFollowUp: "Not scheduled",
        notes: [],
        conversionProbability: form.leadScore,
        aiRecommendations: ["New contact — no history yet.", "Recommend an introductory call."],
      };
      // Show it immediately, then reconcile with the persisted record.
      setContacts((cs) => [newContact, ...cs]);
      try {
        const created = await createContactApi({
          name: newContact.name,
          phone_number: newContact.phone,
          email: newContact.email || undefined,
          company: newContact.company || undefined,
          tags: tags.join(", ") || undefined,
          industry: form.industry || undefined,
          lead_score: form.leadScore,
          pipeline_stage: newContact.status,
        });
        // Swap the optimistic id for the real backend id so this contact is
        // the same record the campaign builder will list.
        if (created?.id) {
          setContacts((cs) => cs.map((c) => (c.id === localId ? { ...newContact, id: created.id } : c)));
        }
        toast.success("Contact added");
      } catch (err: any) {
        if (backendLive) {
          setContacts((cs) => cs.filter((c) => c.id !== localId));
          toast.error(err?.response?.data?.detail || "Couldn't save the contact. Run the DB migration and restart the API.");
        } else {
          toast("Added locally — the backend is offline, so it won't appear in campaigns yet.");
        }
      }
    }

    setModalOpen(false);
    setEditingContact(null);
  };

  const activeFilterCount =
    filters.statuses.length +
    filters.scoreRanges.length +
    filters.industries.length +
    filters.tags.length +
    (filters.lastContacted ? 1 : 0);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-28">
      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />

      <ContactsHeader
        onImport={() => fileInputRef.current?.click()}
        onExport={() => toast.success("Exporting contacts…")}
        onAdd={openAddModal}
      />

      {loading ? (
        <div className="w-full bg-white rounded-2xl p-10 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] flex flex-col items-center justify-center text-center min-h-[420px]">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">Loading contacts…</p>
        </div>
      ) : loadError ? (
        <div className="w-full bg-white rounded-2xl p-10 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] flex flex-col items-center justify-center text-center min-h-[420px]">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Couldn&apos;t load contacts</h3>
          <p className="text-slate-400 text-sm font-medium max-w-md mb-6 leading-relaxed">
            The backend didn&apos;t respond. If this is a fresh deploy, apply the database migration
            (<span className="font-mono text-slate-500">alembic upgrade head</span>) and restart the API.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setLoadError(false);
              refreshContacts()
                .then(() => setBackendLive(true))
                .catch(() => setLoadError(true))
                .finally(() => setLoading(false));
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
          >
            Retry
          </button>
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState onImport={() => fileInputRef.current?.click()} onAdd={openAddModal} />
      ) : (
        <>
          <ContactsKPIs cards={kpis} />
          <PipelineOverview stages={pipeline} activeStage={activeStage} onSelect={selectStage} />
          <SearchBar value={filters.search} onChange={setSearch} />

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
            {/* Filters */}
            <div className="space-y-3">
              <button
                onClick={() => setFiltersOpen((o) => !o)}
                className="lg:hidden w-full inline-flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80"
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/70 rounded-full px-1.5 py-0.5">
                      {activeFilterCount}
                    </span>
                  )}
                </span>
              </button>
              <div className={`${filtersOpen ? "block" : "hidden"} lg:block lg:sticky lg:top-6`}>
                <FilterSidebar
                  config={filterConfig}
                  filters={filters}
                  onToggleMulti={toggleMulti}
                  onSetLastContacted={setLastContacted}
                  onClearAll={clearAll}
                />
              </div>
            </div>

            {/* Table */}
            <div className="min-w-0 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-slate-500 font-medium">
                  <span className="font-semibold text-slate-700 tabular-nums">{filtered.length}</span>{" "}
                  {filtered.length === 1 ? "contact" : "contacts"}
                  {activeFilterCount > 0 || filters.search ? " · filtered" : ""}
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white/95 rounded-2xl border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] p-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">No contacts match your filters.</p>
                  <button onClick={clearAll} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 mt-2">
                    Clear filters
                  </button>
                </div>
              ) : (
                <ContactsTable
                  contacts={filtered}
                  selectedIds={visibleSelected}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  onRowClick={setDrawerContact}
                  onQuickAction={handleQuickAction}
                />
              )}
            </div>
          </div>
        </>
      )}

      <BulkActionBar count={visibleSelected.length} onAction={handleBulkAction} onClear={clearSelection} />

      <ContactDrawer
        contact={drawerContact}
        onClose={() => setDrawerContact(null)}
        onStartCall={(c) => toast.success(`Calling ${c.name}…`)}
        onOpenConversation={() => toast("Opening conversation…")}
        onScheduleFollowUp={(c) => toast(`Schedule a follow-up with ${c.name}`)}
      />

      <AddContactModal
        open={modalOpen}
        initial={editingContact}
        industries={filterConfig.industries}
        statuses={filterConfig.statuses}
        onClose={() => {
          setModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
      />
    </div>
  );
}

function EmptyState({ onImport, onAdd }: { onImport: () => void; onAdd: () => void }) {
  return (
    <div className="w-full bg-white rounded-2xl p-10 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] flex flex-col items-center justify-center text-center min-h-[420px]">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center mb-6">
        <Users className="w-8 h-8 text-indigo-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 font-sans tracking-tight mb-2">No contacts yet</h3>
      <p className="text-slate-400 text-sm font-medium max-w-sm mb-8 leading-relaxed">
        Import a CSV or create your first contact to start building your AI calling lists.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={onImport}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 transition-all"
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>
    </div>
  );
}
