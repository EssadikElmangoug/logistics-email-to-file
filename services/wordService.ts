import * as docx from "docx";
import { ShipmentData } from "../types";

const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, BorderStyle, AlignmentType } = docx;

// Constants for layout
const MAX_DIMENSION_ROWS = 5;
const CELL_PADDING = 100;

// Helper for creating a standard cell
const createCell = (text: string, bold = false, widthPercent?: number, shadingColor?: string) => {
  return new TableCell({
    width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
    shading: shadingColor ? { fill: shadingColor } : undefined,
    margins: { top: CELL_PADDING, bottom: CELL_PADDING, left: CELL_PADDING, right: CELL_PADDING },
    children: [
      new Paragraph({
        children: [new TextRun({ text: text || "N/A", bold: bold, font: "Calibri", size: 22 })], // 22 half-points = 11pt
        alignment: AlignmentType.LEFT,
      }),
    ],
  });
};

// Helper for header cells
const createHeaderCell = (text: string) => {
  return createCell(text, true, undefined, "E7E6E6");
};

export const generateAndDownloadWord = async (data: ShipmentData) => {
  
  // 1. HEADER SECTION
  const headerParagraph = new Paragraph({
    children: [
      new TextRun({
        text: "SHIPMENT REQUEST ORDER",
        bold: true,
        size: 32, // 16pt
        font: "Calibri",
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  });

  // Customer Name Section
  const customerParagraph = new Paragraph({
    children: [
      new TextRun({
        text: `Customer: ${data.customerName || "N/A"}`,
        bold: true,
        size: 24, // 12pt
        font: "Calibri",
      }),
    ],
    alignment: AlignmentType.LEFT,
    spacing: { after: 200 },
  });

  // 2. ROUTE TABLE (Shipper / Receiver)
  const routeTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createHeaderCell("SHIPPER (PICKUP)"),
          createHeaderCell("RECEIVER (DELIVERY)"),
        ],
      }),
      new TableRow({
        children: [
          createCell(`${data.shipper.city}, ${data.shipper.stateOrProvince} ${data.shipper.postalCode || ""}`),
          createCell(`${data.receiver.city}, ${data.receiver.stateOrProvince} ${data.receiver.postalCode || ""}`),
        ],
      }),
    ],
  });

  // 3. DETAILS SECTION
  const detailsHeader = new Paragraph({
    text: "SHIPMENT DETAILS",
    heading: docx.HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
  });

  // Classification Table
  const classificationTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createHeaderCell("SHIPMENT TYPE"),
          createCell(data.details.shipmentType || "N/A"),
          createHeaderCell("RECEIVER TYPE"),
          createCell(data.details.receiverType || "N/A"),
        ],
      }),
      new TableRow({
        children: [
          createHeaderCell("CROSS BORDER"),
          createCell(data.details.crossBorderStatus || "N/A"),
          createHeaderCell("TIMING"),
          createCell(data.details.shipmentTiming || "N/A"),
        ],
      }),
      new TableRow({
        children: [
          createHeaderCell("READY TIME"),
          createCell(data.details.readyTime || "N/A"),
          createHeaderCell(""),
          createCell(""),
        ],
      }),
    ],
  });

  // Commodity Details Table
  const commodityTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createHeaderCell("COMMODITY"),
          createCell(data.details.commodity || "N/A"),
          createHeaderCell("EQUIPMENT TYPE"),
          createCell(data.details.equipmentType || "N/A"),
        ],
      }),
      new TableRow({
        children: [
          createHeaderCell("HAZMAT"),
          createCell(data.details.isHazmat ? "YES" : "NO"),
          createHeaderCell("UN NUMBER"),
          createCell(data.details.unNumber || "N/A"),
        ],
      }),
    ],
  });

  const detailsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Row 1: Service Type & Weight
      new TableRow({
        children: [
          createHeaderCell("SERVICE TYPE"),
          createCell(data.details.serviceType || "N/A"),
          createHeaderCell("TOTAL WEIGHT"),
          createCell(`${data.details.weightLbs} lbs`),
        ],
      }),
      // Row 2: Reefer & Appointments
      new TableRow({
        children: [
          createHeaderCell("REEFER REQ."),
          createCell(data.details.isReeferRequired ? "YES" : "NO"),
          createHeaderCell("APPOINTMENTS"),
          createCell(data.details.appointments || "N/A"),
        ],
      }),
      // Row 3: Reefer Temperature
      new TableRow({
        children: [
          createHeaderCell("REEFER TEMP"),
          createCell(data.details.reeferTemperature || "N/A"),
          createHeaderCell(""),
          createCell(""),
        ],
      }),
    ],
  });

  // 4. NOTES SECTION
  const notesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [createHeaderCell("ADDITIONAL NOTES")] }),
      new TableRow({ 
        children: [createCell(data.details.additionalNotes || "N/A")] 
      }),
    ],
  });

  // 5. DIMENSIONS SECTION
  const dimensionsHeader = new Paragraph({
    text: "DIMENSIONS",
    heading: docx.HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
  });

  // Header Row for Dimensions
  const dimHeaderRow = new TableRow({
    children: [
      createHeaderCell("QTY"),
      createHeaderCell("LENGTH"),
      createHeaderCell("WIDTH"),
      createHeaderCell("HEIGHT"),
    ],
  });

  const dimRows: docx.TableRow[] = [dimHeaderRow];

  // Create fixed number of rows
  for (let i = 0; i < MAX_DIMENSION_ROWS; i++) {
    const dim = data.details.dimensions[i];
    dimRows.push(
      new TableRow({
        children: [
          createCell(dim?.quantity || "N/A"),
          createCell(dim?.length || "N/A"),
          createCell(dim?.width || "N/A"),
          createCell(dim?.height || "N/A"),
        ],
      })
    );
  }

  const dimTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: dimRows,
  });

  // Section headers
  const classificationHeader = new Paragraph({
    text: "CLASSIFICATION",
    heading: docx.HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
  });

  const commodityHeader = new Paragraph({
    text: "COMMODITY DETAILS",
    heading: docx.HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
  });

  // ASSEMBLE DOCUMENT
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          headerParagraph,
          customerParagraph,
          routeTable,
          new Paragraph({ text: "" }), // Spacer
          classificationHeader,
          classificationTable,
          new Paragraph({ text: "" }), // Spacer
          commodityHeader,
          commodityTable,
          new Paragraph({ text: "" }), // Spacer
          detailsHeader,
          detailsTable,
          new Paragraph({ text: "" }), // Spacer
          dimensionsHeader,
          dimTable,
          new Paragraph({ text: "" }), // Spacer
          notesTable,
        ],
      },
    ],
  });

  // GENERATE AND DOWNLOAD
  const blob = await Packer.toBlob(doc);
  
  // Create download link programmatically
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  a.href = url;
  
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  a.download = `Shipment_Order_${date}_${time}.docx`;
  
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};