import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ExportButtons({ data, filename = 'export', columns }) {
    function exportCSV() {
        if (!data || data.length === 0) return;
        const headers = columns.map(c => c.label);
        const rows = data.map(row => columns.map(c => {
            const val = c.accessor(row);
            return val === null || val === undefined ? '' : String(val);
        }));
        const csv = [headers, ...rows].map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `${filename}.csv`);
    }

    function exportExcel() {
        if (!data || data.length === 0) return;
        const headers = columns.map(c => c.label);
        const rows = data.map(row => columns.map(c => {
            const val = c.accessor(row);
            return val === null || val === undefined ? '' : val;
        }));
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    }

    function downloadBlob(blob, name) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="export-buttons">
            <button className="btn-admin btn-admin--secondary btn-admin--sm" onClick={exportCSV}>
                <Download size={14} /> CSV
            </button>
            <button className="btn-admin btn-admin--secondary btn-admin--sm" onClick={exportExcel}>
                <Download size={14} /> Excel
            </button>
        </div>
    );
}
