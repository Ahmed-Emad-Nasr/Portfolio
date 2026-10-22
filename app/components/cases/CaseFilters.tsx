"use client";

/*
 * CaseFilters — search + category tabs + tool chips for the case library.
 * The tabs are the "Selected work" filter tabs of the original theme; the
 * search field is the contact form's underline input.
 */

import React from "react";
import { Search, X } from "lucide-react";
import { filterTab } from "@/app/components/shared/kit";

export type Facet = { value: string; count: number };

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
}: CaseFiltersProps) {
  const isFiltered = Boolean(query) || activeCategory !== null || activeTools.length > 0;

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
          className="w-full bg-transparent py-4 focus:outline-none text-lg font-light placeholder:text-foreground/30 font-mono"
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
