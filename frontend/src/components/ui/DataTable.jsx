import clsx from 'clsx'
import styles from './DataTable.module.css'

/*
 * Accessible, horizontally scrollable table.
 * align: 'end' (default, right-aligned numbers) or 'start' (left-aligned text columns)
 * columns: [{ id, header }]   rows: [{ id, label, cells: { [columnId]: node } }]
 */
export default function DataTable({ caption, labelHeader = 'Metric', columns, rows, align = 'end' }) {
  const cellClass = align === 'end' ? styles.numeric : undefined
  return (
    // Scrollable regions need to be keyboard focusable so narrow screens can scroll them.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div className={styles.scroll} role="region" aria-label={caption} tabIndex={0}>
      <table className={clsx(styles.table, align === 'start' && styles.text)}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{labelHeader}</th>
            {columns.map((column) => (
              <th key={column.id} scope="col" className={cellClass}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.label}</th>
              {columns.map((column) => (
                <td key={column.id} className={cellClass}>
                  {row.cells[column.id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
