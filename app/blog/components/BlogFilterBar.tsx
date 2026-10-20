"use client";

/*
 * BlogFilterBar.tsx
 * Author: Ahmed Emad Nasr
 *
 * Search + filtering for the PDF library. Previously the library was a static list in a single order,
 * so anyone looking for "Wazuh" or "Registry" had to scan every card by eye.
 *
 * The filters live in URL-less client state on purpose: the page is a static export,
 * and any state in the query string would have needed router.replace on every keystroke.
 *
 * The chips show a count next to each option — so the user knows how many results they'll get before clicking.
 */

import React from "react";
import styles from "./BlogFilterBar.module.css";

export type Facet = { value: string; count: number };

type BlogFilterBarProps = {
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

function BlogFilterBar({
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
}: BlogFilterBarProps) {
  const isFiltered = Boolean(query) || activeCategory !== null || activeTools.length > 0;

  return (
    <div className={styles.bar}>
      <div className={styles.searchRow}>
        <span className={styles.prompt} aria-hidden="true">
          &gt;
        </span>
        <input
          type="search"
          data-fx="field"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search cases, tools, tags…"
          aria-label="Search cases"
          autoComplete="off"
          spellCheck={false}
        />
        {isFiltered && (
          <button type="button" className={styles.reset} onClick={onReset}>
            Clear
          </button>
        )}
      </div>

      <div className={styles.facetGroup} role="group" aria-label="Filter by category">
        <span className={styles.facetLabel}>Category</span>
        <button
          type="button"
          className={activeCategory === null ? `${styles.chip} ${styles.chipActive}` : styles.chip}
          onClick={() => onCategoryChange(null)}
          aria-pressed={activeCategory === null}
        >
          All
          <span className={styles.count}>{totalCount}</span>
        </button>
        {categories.map(({ value, count }) => (
          <button
            key={value}
            type="button"
            className={activeCategory === value ? `${styles.chip} ${styles.chipActive}` : styles.chip}
            onClick={() => onCategoryChange(activeCategory === value ? null : value)}
            aria-pressed={activeCategory === value}
          >
            {value}
            <span className={styles.count}>{count}</span>
          </button>
        ))}
      </div>

      <div className={styles.facetGroup} role="group" aria-label="Filter by tool">
        <span className={styles.facetLabel}>Tools</span>
        {tools.map(({ value, count }) => {
          const active = activeTools.includes(value);
          return (
            <button
              key={value}
              type="button"
              className={active ? `${styles.toolChip} ${styles.chipActive}` : styles.toolChip}
              onClick={() => onToolToggle(value)}
              aria-pressed={active}
            >
              {value}
              <span className={styles.count}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* aria-live: screen readers hear the result count while filtering, without
          having to go to the list and count it */}
      <p className={styles.status} role="status" aria-live="polite">
        {resultCount} of {totalCount} case(s)
        {isFiltered ? " match your filters" : " in the library"}
      </p>
    </div>
  );
}

export default React.memo(BlogFilterBar);
