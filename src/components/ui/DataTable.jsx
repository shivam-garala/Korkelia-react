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
}) {
  const showFilters = Boolean(filters && onFiltersChange);

  return (
    <div className={styles.card}>
      <div className={styles.tableWrap}>
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
            {rows?.length ? (
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
          </tbody>
        </table>
      </div>
    </div>
  );
}

