// Turns a loaded data table into one object per row, keeping only the named columns.
// Values are copied unchanged; a missing column gives undefined (never a made-up value).
export function toObjects(table, names) {
  const positions = names.map((name) => table.index[name])
  return table.rows.map((row) => Object.fromEntries(names.map((name, i) => [name, positions[i] === undefined ? undefined : row[positions[i]]])))
}
