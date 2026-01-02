import { useCallback, useEffect, useRef } from "react";
import styles from "./DataTable.module.css";

function defaultGetRowKey(row, index) {
  return row?.id ?? row?.key ?? index;
}

export default function DataTable({
  columns,
  rows,
  getRowKey = defaultGetRowKey,
  filters = null,
  onFiltersChange = null,
  emptyMessage = "No data",
  useInfiniteScroll = false,
  onLoadMore = null,
  hasMore = true,
  loadingMore = false,
  scrollThreshold = 0.8,
  scrollableTarget = null,
}) {
  const showFilters = Boolean(filters && onFiltersChange);
  const isLoadingRef = useRef(false);
  const rowCount = rows?.length ?? 0;

  const handleScroll = useCallback(
    (event) => {
      if (!useInfiniteScroll || !onLoadMore || !hasMore || loadingMore) return;
      if (isLoadingRef.current) return;

      const target = event.currentTarget;
      if (!target) return;

      const { scrollTop, clientHeight, scrollHeight } = target;
      if (!scrollHeight) return;

      const threshold = Math.min(1, Math.max(0, Number(scrollThreshold) || 0.8));
      if ((scrollTop + clientHeight) / scrollHeight >= threshold) {
        isLoadingRef.current = true;
        onLoadMore();
      }
    },
    [useInfiniteScroll, onLoadMore, hasMore, loadingMore, scrollThreshold]
  );

  useEffect(() => {
    if (!useInfiniteScroll) {
      isLoadingRef.current = false;
      return;
    }
    if (!loadingMore) {
      isLoadingRef.current = false;
    }
  }, [useInfiniteScroll, loadingMore]);

  useEffect(() => {
    if (useInfiniteScroll) {
      isLoadingRef.current = false;
    }
  }, [rowCount, useInfiniteScroll]);

  return (
    <div className={styles.card}>
      <div
        className={styles.tableWrap}
        onScroll={useInfiniteScroll ? handleScroll : undefined}
        id={useInfiniteScroll && scrollableTarget ? scrollableTarget : undefined}
      >
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={styles.th}>
                  {col.header}
                </th>
              ))}
            </tr>
            {showFilters ? (
              <tr>
                {columns.map((col) => (
                  <th key={`${col.key}-filter`} className={styles.thFilter}>
                    {col.filterable ? (
                      <input
                        className={styles.filterInput}
                        style={col.filterInputStyle}
                        value={filters?.[col.key] ?? ""}
                        onChange={(e) =>
                          onFiltersChange({
                            ...filters,
                            [col.key]: e.target.value,
                          })
                        }
                        placeholder={col.filterPlaceholder ?? `Search ${String(col.header ?? col.key)}`}
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            ) : null}
          </thead>
          <tbody>
            {rowCount ? (
              rows.map((row, index) => (
                <tr key={String(getRowKey(row, index))} className={styles.tr}>
                  {columns.map((col) => (
                    <td key={`${String(getRowKey(row, index))}-${col.key}`} className={styles.td}>
                      {col.render ? col.render(row, index) : row?.[col.key] ?? ""}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className={styles.tr}>
                <td className={styles.emptyCell} colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
            {useInfiniteScroll && loadingMore && rowCount ? (
              <tr className={styles.tr}>
                <td className={styles.emptyCell} colSpan={columns.length}>
                  Loading...
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
