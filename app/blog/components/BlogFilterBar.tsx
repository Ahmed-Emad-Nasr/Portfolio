"use client";

/*
 * BlogFilterBar.tsx
 * Author: Ahmed Emad Nasr
 *
 * بحث + فلترة للـ PDF library. قبل كده كانت المكتبة قايمة ثابتة بترتيب واحد،
 * فاللي داخل يدوّر على "Wazuh" أو "Registry" لازم ينزل بعينه على الكروت كلها.
 *
 * الفلاتر كلها في الـ URL-less client state عن قصد: الصفحة static export،
 * وأي state في الـ query string كان هيحتاج router.replace في كل ضغطة.
 *
 * الـ chips بتوري العدد جنب كل اختيار — فالمستخدم عارف قبل ما يضغط هيلاقي كام.
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
          className={styles.input}
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

      {/* aria-live: الـ screen reader بيسمع عدد النتائج وهو بيفلتر، من غير
          ما يضطر يروح للقايمة يعدّها */}
      <p className={styles.status} role="status" aria-live="polite">
        {resultCount} of {totalCount} case(s)
        {isFiltered ? " match your filters" : " in the library"}
      </p>
    </div>
  );
}

export default React.memo(BlogFilterBar);
