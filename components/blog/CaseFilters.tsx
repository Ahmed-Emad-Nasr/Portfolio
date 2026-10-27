"use client";

/* CaseFilters — search, kind/category tabs, tool chips, sort and view for the case library */

import React from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
import type { CaseKind } from "@/lib/shared";
import { filterTab } from "@/components/ui/kit";

type Facet = { value: string; count: number };

type CaseFiltersProps = {
  query: string;
  onQueryChange: (value: string) => void;
  categories: readonly Facet[];
  activeCategory: string | null;
  onCategoryChange: (value: string | null) => void;
  tools: readonly Facet[];
  activeTools: readonly string[];
  onToolToggle: (value: string) => void;
  resultCount: number;
  totalCount: number;
  onReset: () => void;
  kinds: readonly { value: CaseKind; label: string; count: number }[];
  activeKind: CaseKind | null;
  onKindChange: (value: CaseKind | null) => void;
  sort: "recommended" | "newest";
  onSortChange: (value: "recommended" | "newest") => void;
  view: "cards" | "list";
  onViewChange: (value: "cards" | "list") => void;
};

function CaseFilters({
  query,
  onQueryChange,
  categories,
  activeCategory,
  onCategoryChange,
  tools,
  activeTools,
  onToolToggle,
  resultCount,
  totalCount,
  onReset,
  kinds,
  activeKind,
  onKindChange,
  sort,
  onSortChange,
  view,
  onViewChange,
}: CaseFiltersProps) {
  const isFiltered = Boolean(query) || activeCategory !== null || activeTools.length > 0 || activeKind !== null;

  return (
    <div className="mb-12 flex flex-col gap-8">
      <div className="relative flex items-center gap-3 border-b border-foreground/10 focus-within:border-primary transition-colors duration-300">
        <Search size={18} className="shrink-0 text-foreground/30" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search cases, tools, tags…"
          aria-label="Search cases"
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent py-4 focus:outline-none text-lg font-light placeholder:text-foreground/60 font-mono"
        />
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-primary/40 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-primary-ink hover:bg-primary hover:text-white transition-colors duration-300"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* What kind of work: the strongest filter, so it comes first — a segmented
          bar whose active segment slides under the label */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap border border-foreground/10 bg-surface/40 w-fit" role="group" aria-label="Filter by kind of work">
          {[{ value: null, label: "Everything", count: totalCount }, ...kinds].map((k) => {
            const active = activeKind === k.value;
            return (
              <button
                key={k.value ?? "all"}
                type="button"
                onClick={() => onKindChange(k.value as CaseKind | null)}
                aria-pressed={active}
                className={`relative px-4 py-2.5 font-mono text-[0.625rem] font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${
                  active ? "text-white" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <span
                  className={`absolute inset-0 bg-primary origin-left transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${active ? "scale-x-100" : "scale-x-0"}`}
                  aria-hidden="true"
                />
                <span className="relative">
                  {k.label} <span className="ml-1 tabular-nums">{k.count}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">
            Sort
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value === "newest" ? "newest" : "recommended")}
              className="bg-surface border border-foreground/10 px-2 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.15em] text-foreground focus:outline-none focus:border-primary"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest</option>
            </select>
          </label>
          <div className="flex border border-foreground/10" role="group" aria-label="Layout">
            {(["cards", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onViewChange(v)}
                aria-pressed={view === v}
                aria-label={v === "cards" ? "Card view" : "List view"}
                className={`p-2 transition-colors duration-300 ${view === v ? "bg-foreground/10 text-primary-ink" : "text-foreground/60 hover:text-foreground"}`}
              >
                {v === "cards" ? <LayoutGrid size={14} /> : <List size={14} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3" role="group" aria-label="Filter by category">
        <button
          type="button"
          className={filterTab(activeCategory === null)}
          onClick={() => onCategoryChange(null)}
          aria-pressed={activeCategory === null}
        >
          All <span className="ml-2 text-[0.5625rem] tabular-nums">{totalCount}</span>
        </button>
        {categories.map(({ value, count }) => (
          <button
            key={value}
            type="button"
            className={filterTab(activeCategory === value)}
            onClick={() => onCategoryChange(activeCategory === value ? null : value)}
            aria-pressed={activeCategory === value}
          >
            {value} <span className="ml-2 text-[0.5625rem] tabular-nums">{count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tool">
        <span className="mr-2 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-foreground/60">Tools</span>
        {tools.map(({ value, count }) => {
          const active = activeTools.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToolToggle(value)}
              aria-pressed={active}
              className={`px-3 py-1.5 font-mono text-[0.625rem] font-bold uppercase tracking-[0.15em] border transition-colors duration-300 ${
                active
                  ? "bg-tertiary text-background border-tertiary"
                  : "text-tertiary bg-tertiary/10 border-tertiary/25 hover:border-tertiary"
              }`}
            >
              {value} <span className="ml-1 tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-foreground/60" role="status" aria-live="polite">
        <span className="w-2 h-2 bg-primary" aria-hidden="true" />
        {resultCount} of {totalCount} case(s)
        {isFiltered ? " match your filters" : " in the library"}
      </p>
    </div>
  );
}

export default React.memo(CaseFilters);
