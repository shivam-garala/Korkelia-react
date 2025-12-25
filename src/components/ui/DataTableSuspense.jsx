"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Skeleton from "@/app/components/ui/Skeleton.jsx";
import styles from "./DataTable.module.css";

const DataTable = dynamic(() => import("./DataTable.jsx"), { suspense: true });

function TableSkeleton({ columns = 5, rows = 6 }) {
  const headerItems = Array.from({ length: columns }, (_, index) => (
    <Skeleton key={`header-${index}`} height={14} />
  ));
  const rowItems = Array.from({ length: rows }, (_, rowIndex) => (
    <div
      key={`row-${rowIndex}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: "12px",
        padding: "10px 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {Array.from({ length: columns }, (_, colIndex) => (
        <Skeleton key={`cell-${rowIndex}-${colIndex}`} height={12} />
      ))}
    </div>
  ));

  return (
    <div className={styles.card}>
      <div style={{ padding: "12px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: "12px",
            paddingBottom: "12px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {headerItems}
        </div>
        {rowItems}
      </div>
    </div>
  );
}

export default function DataTableSuspense({ columns = [], rows = [], ...props }) {
  const fallbackRows = rows?.length ? Math.min(rows.length, 6) : 6;
  const fallbackColumns = columns?.length ? columns.length : 5;

  return (
    <Suspense fallback={<TableSkeleton columns={fallbackColumns} rows={fallbackRows} />}>
      <DataTable columns={columns} rows={rows} {...props} />
    </Suspense>
  );
}
