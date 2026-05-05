export function filterByKeyword(rows, keyword, fields) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return rows;
  }

  return rows.filter((row) =>
    fields.some((field) => String(row[field] ?? '').toLowerCase().includes(normalizedKeyword)),
  );
}
