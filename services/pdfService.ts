import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, TransactionType, UserProfile, Loan } from '../types';
import { formatMoney } from '../constants';

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generateReceipt = (transaction: Transaction, userCountry: string = 'CO') => {
  const doc = new jsPDF();
  
  // Apple-like clean header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text("Recibo de Transacción", 20, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`ID: ${transaction.id.toUpperCase()}`, 20, 40);
  doc.text(`Fecha: ${formatDate(transaction.date)}`, 20, 45);

  // Decorative Line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.line(20, 55, 190, 55);

  // Big Amount
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  const color = transaction.type === TransactionType.INCOME 
    ? [16, 185, 129] // Emerald
    : transaction.type === TransactionType.EXPENSE || transaction.type === TransactionType.LENDING
      ? [244, 63, 94] // Rose
      : [59, 130, 246]; // Blue
      
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(formatMoney(transaction.amount, userCountry), 20, 80);

  // Details Table
  const tableData = [
    ['Tipo de Operación', transaction.type === TransactionType.LENDING ? 'PRÉSTAMO OTORGADO' : transaction.type.toUpperCase()],
    ['Categoría/Fuente', transaction.category || transaction.source || transaction.savingType || '-'],
    ['Método', transaction.paymentMethod || '-'],
    ['Detalle', transaction.description || '-']
  ];

  autoTable(doc, {
    startY: 100,
    head: [['Concepto', 'Detalle']],
    body: tableData,
    theme: 'plain',
    styles: { fontSize: 12, cellPadding: 6 },
    headStyles: { fillColor: [241, 245, 249], textColor: 50, fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
    },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Generado por Finovate - Control Financiero Inteligente", 20, pageHeight - 10);

  // Open in new tab
  const pdfBlob = doc.output('bloburl');
  window.open(pdfBlob, '_blank');
};

export const generateReport = (transactions: Transaction[], periodName: string, stats: any, userCountry: string = 'CO') => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text("Reporte Financiero", 14, 25);
  
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  doc.text(`Periodo: ${periodName}`, 14, 35);

  // Summary Section
  doc.setDrawColor(200);
  doc.line(14, 45, 196, 45);

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Resumen General", 14, 55);
  
  const summaryData = [
    ['Ingresos Totales', formatMoney(stats.totalIncome, userCountry)],
    ['Gastos Totales (Inc. Préstamos)', formatMoney(stats.totalExpense, userCountry)],
    ['Ahorros Totales', formatMoney(stats.totalSavings, userCountry)],
    ['Balance Neto', formatMoney(stats.netBalance, userCountry)],
  ];

  autoTable(doc, {
    startY: 60,
    body: summaryData,
    theme: 'grid',
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: 'bold', fillColor: [248, 250, 252] } }
  });

  // Transactions Table
  doc.text("Detalle de Movimientos", 14, (doc as any).lastAutoTable.finalY + 15);
  
  const txRows = transactions.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.type === TransactionType.LENDING ? 'PRÉSTAMO' : t.type.toUpperCase(),
    t.category || t.source || t.savingType || '-',
    t.description || '',
    formatMoney(t.amount, userCountry)
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto']],
    body: txRows,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 }
  });

  const pdfBlob = doc.output('bloburl');
  window.open(pdfBlob, '_blank');
};

export const generateLoanContract = (loan: Loan, lenderName: string, userCountry: string = 'CO') => {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - (margin * 2);

  // Header
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("CONTRATO DE MUTUO / PRÉSTAMO DE DINERO", pageWidth / 2, 30, { align: 'center' });

  doc.setFont("times", "normal");
  doc.setFontSize(12);

  let y = 50;
  const date = formatDate(loan.startDate);

  // Body Text
  const text = `En la ciudad de __________________, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleString('es-ES', { month: 'long' })} de ${new Date().getFullYear()}, comparecen:\n\n` +
  `DE UNA PARTE: ${lenderName.toUpperCase()}, mayor de edad, identificado(a) como EL ACREEDOR.\n\n` +
  `DE OTRA PARTE: ${loan.borrowerName.toUpperCase()}, identificado(a) con documento N° ${loan.borrowerId}, denominado en adelante EL DEUDOR.\n\n` +
  `Ambas partes acuerdan celebrar el presente CONTRATO DE PRÉSTAMO, regido por las siguientes cláusulas:\n\n` +
  `PRIMERA. OBJETO: El ACREEDOR entrega al DEUDOR en calidad de préstamo la suma de ${formatMoney(loan.principalAmount, userCountry)}.\n\n` +
  `SEGUNDA. INTERESES: El DEUDOR se compromete a pagar mensualmente intereses del ${loan.interestRate}% sobre el capital prestado, valor que corresponde a la cuota establecida.\n\n` +
  `TERCERA. FORMA DE PAGO: El pago de los intereses se realizará mediante cuotas ${loan.frequency.toLowerCase()}s de ${formatMoney(loan.installmentAmount, userCountry)}.\n\n` +
  `CUARTA. PLAZO Y DEVOLUCIÓN DE CAPITAL: El plazo total para el pago del crédito es de ${loan.termMonths} meses, iniciando el ${date}. Al finalizar este plazo, el DEUDOR deberá realizar la devolución íntegra del capital prestado (${formatMoney(loan.principalAmount, userCountry)}).\n\n` +
  `QUINTA. TOTAL DEL CONTRATO: La suma total proyectada a pagar (Intereses + Capital) al finalizar el plazo será de ${formatMoney(loan.totalToPay, userCountry)}.\n\n` +
  `Para constancia, se firma el presente documento en dos ejemplares del mismo tenor.`;

  const splitText = doc.splitTextToSize(text, contentWidth);
  doc.text(splitText, margin, y);

  // Signatures
  y += 140;
  
  doc.line(margin, y, margin + 70, y); // Line 1
  doc.text("EL ACREEDOR", margin, y + 10);
  doc.text(lenderName, margin, y + 16);

  doc.line(pageWidth - margin - 70, y, pageWidth - margin, y); // Line 2
  doc.text("EL DEUDOR", pageWidth - margin - 70, y + 10);
  doc.text(loan.borrowerName, pageWidth - margin - 70, y + 16);
  doc.text(`C.C. ${loan.borrowerId}`, pageWidth - margin - 70, y + 22);

  // Open PDF
  const pdfBlob = doc.output('bloburl');
  window.open(pdfBlob, '_blank');
};