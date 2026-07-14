"use client";

import { useMemo, useRef, useState } from "react";
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

import { CRMContact, ContactFilters, EMPTY_FILTERS } from "@/types/contacts-crm";
import { mockContactsData } from "@/utils/mockContacts";

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
  const data = mockContactsData;
  const [contacts, setContacts] = useState<CRMContact[]>(data.contacts);
  const [filters, setFilters] = useState<ContactFilters>(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerContact, setDrawerContact] = useState<CRMContact | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        toast(`Edit ${contact.name}`);
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
        setContacts((cs) => cs.filter((c) => !visibleSelected.includes(c.id)));
        clearSelection();
        toast.success(`Deleted ${n} contacts`);
        break;
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) toast.success("CSV import started");
    if (e.target) e.target.value = "";
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
        onAdd={() => toast("Add a new contact")}
      />

      {contacts.length === 0 ? (
        <EmptyState onImport={() => fileInputRef.current?.click()} onAdd={() => toast("Add a new contact")} />
      ) : (
        <>
          <ContactsKPIs cards={data.kpis} />
          <PipelineOverview stages={data.pipeline} activeStage={activeStage} onSelect={selectStage} />
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
                  config={data.filterConfig}
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
