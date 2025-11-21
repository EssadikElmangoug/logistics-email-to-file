import { jsPDF } from 'jspdf';
import autoTablePkg from 'jspdf-autotable';

// Handle default export for jspdf-autotable
const autoTable = (autoTablePkg.default || autoTablePkg);

export const generatePDFBuffer = (data) => {
  const doc = new jsPDF();
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];

  // Title
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text("SHIPMENT REQUEST ORDER", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${date} ${time}`, 105, 28, { align: "center" });

  let finalY = 35;

  // Customer Name
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Customer: ${data.customerName || "N/A"}`, 14, finalY);
  finalY += 8;

  // Route Table
  autoTable(doc, {
    startY: finalY,
    head: [['SHIPPER (PICKUP)', 'RECEIVER (DELIVERY)']],
    body: [
      [
        `${data.shipper.city}, ${data.shipper.stateOrProvince}\n${data.shipper.postalCode || ''}`,
        `${data.receiver.city}, ${data.receiver.stateOrProvince}\n${data.receiver.postalCode || ''}`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, lineColor: [200, 200, 200] },
    styles: { fontSize: 11, cellPadding: 6, lineColor: [200, 200, 200], lineWidth: 0.1 },
  });

  finalY = doc.lastAutoTable.finalY + 10;

  // Details Title
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("SHIPMENT DETAILS", 14, finalY);
  finalY += 5;

  // Details Table
  autoTable(doc, {
    startY: finalY,
    head: [['SERVICE TYPE', 'TOTAL WEIGHT', 'HAZMAT', 'REEFER REQ.']],
    body: [
      [
        data.details.serviceType || "N/A",
        `${data.details.weightLbs} lbs`,
        data.details.isHazmat ? "YES" : "NO",
        data.details.isReeferRequired ? "YES" : "NO"
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, lineColor: [200, 200, 200] },
    styles: { fontSize: 10, cellPadding: 5, lineColor: [200, 200, 200], lineWidth: 0.1 },
  });

  finalY = doc.lastAutoTable.finalY + 10;

  // Appointments Table
  autoTable(doc, {
    startY: finalY,
    head: [['APPOINTMENTS']],
    body: [[data.details.appointments || "N/A"]],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, lineColor: [200, 200, 200] },
    styles: { fontSize: 10, cellPadding: 5, lineColor: [200, 200, 200], lineWidth: 0.1 },
  });

  finalY = doc.lastAutoTable.finalY + 10;

  // Dimensions Title
  doc.text("DIMENSIONS", 14, finalY);
  finalY += 5;

  // Prepare Dimension Rows (Fixed 5 rows)
  const dimRows = [];
  for(let i = 0; i < 5; i++) {
    const d = data.details.dimensions[i];
    dimRows.push([
      d?.quantity || "N/A",
      d?.length || "N/A",
      d?.width || "N/A",
      d?.height || "N/A"
    ]);
  }

  autoTable(doc, {
    startY: finalY,
    head: [['QTY', 'LENGTH', 'WIDTH', 'HEIGHT']],
    body: dimRows,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, lineColor: [200, 200, 200] },
    styles: { fontSize: 10, cellPadding: 3, lineColor: [200, 200, 200], lineWidth: 0.1 },
  });

  finalY = doc.lastAutoTable.finalY + 10;

  // Notes Title
  doc.text("ADDITIONAL NOTES", 14, finalY);
  finalY += 5;

  autoTable(doc, {
    startY: finalY,
    body: [[data.details.additionalNotes || "N/A"]],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 6, lineColor: [200, 200, 200], lineWidth: 0.1 },
  });

  // Return PDF as buffer
  return doc.output('arraybuffer');
};

