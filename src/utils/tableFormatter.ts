export function printTable(headers: string[], rows: string[][]) {
    // Calculate column widths
    const colWidths = headers.map((h, i) =>
        Math.max(
            h.length,
            ...rows.map(row => (row[i] || '').toString().length)
        )
    );

    // Create separator line
    const separator = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';

    // Print headers
    console.log(separator);
    console.log('|' + headers.map((h, i) => ` ${h.padEnd(colWidths[i])} `).join('|') + '|');
    console.log(separator);

    // Print rows
    rows.forEach(row => {
        console.log('|' + row.map((cell, i) => ` ${cell.toString().padEnd(colWidths[i])} `).join('|') + '|');
    });
    console.log(separator);
} 