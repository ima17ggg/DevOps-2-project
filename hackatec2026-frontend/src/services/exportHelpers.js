import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importar como función por defecto

// Exportar a Excel (.xlsx)
export const exportToExcel = (data, fileName = 'Reporte') => {
  if (!data || data.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidentes');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// Exportar a PDF (.pdf)
export const exportToPDF = (data, fileName = 'Reporte', title = 'Reporte de Incidentes') => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();

  const headers = Object.keys(data[0]);
  const rows = data.map((item) => Object.values(item));

  // Título del PDF
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  // Llamar directamente a la función autoTable pasando la instancia `doc`
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 22,
    theme: 'grid',
    headStyles: { fillColor: [4, 22, 50] },
  });

  doc.save(`${fileName}.pdf`);
};