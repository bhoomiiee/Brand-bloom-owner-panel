function sanitizeCell(cell: string): string {
  const trimmed = cell.trim();
  // Protection against spreadsheet formula injection (CSV injection)
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(sanitizeCell(current));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(sanitizeCell(current));
  return result;
}

export const fileParserService = {
  parseCSV(content: string): { headers: string[]; rows: string[][] } {
    const rawLines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const lines = rawLines.map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = parseCSVLine(lines[0]).map(h => h.replace(/^'/, '').toLowerCase());
    const rows = lines.slice(1).map(l => parseCSVLine(l));

    return { headers, rows };
  }
};
