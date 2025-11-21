import { utils, writeFile } from 'xlsx';
import { ShipmentData } from "../types";

export const generateAndDownloadExcel = (data: ShipmentData) => {
  const wb = utils.book_new();

  // Helper to create a blank row
  const blank = ["", "", "", ""];

  // Construct a "Form" like structure in the array of arrays
  const wsData = [
    ["SHIPMENT REQUEST ORDER"],
    blank,
    ["CUSTOMER", data.customerName || "N/A", "", ""],
    blank,
    ["SHIPPER (PICKUP)", "", "RECEIVER (DELIVERY)", ""],
    [
      `${data.shipper.city}, ${data.shipper.stateOrProvince} ${data.shipper.postalCode || ""}`, 
      "", 
      `${data.receiver.city}, ${data.receiver.stateOrProvince} ${data.receiver.postalCode || ""}`,
      ""
    ],
    blank,
    ["SHIPMENT DETAILS"],
    ["SERVICE TYPE", "TOTAL WEIGHT", "HAZMAT", "REEFER REQ."],
    [
      data.details.serviceType || "N/A",
      `${data.details.weightLbs} lbs`, 
      data.details.isHazmat ? "YES" : "NO", 
      data.details.isReeferRequired ? "YES" : "NO"
    ],
    ["APPOINTMENTS", data.details.appointments || "N/A", "", ""],
    blank,
    ["DIMENSIONS"],
    ["QTY", "LENGTH", "WIDTH", "HEIGHT"]
  ];

  // Add fixed 5 rows for dimensions
  for (let i = 0; i < 5; i++) {
    const dim = data.details.dimensions[i];
    wsData.push([
      dim?.quantity || "N/A",
      dim?.length || "N/A",
      dim?.width || "N/A",
      dim?.height || "N/A"
    ]);
  }

  wsData.push(blank);
  wsData.push(["ADDITIONAL NOTES"]);
  wsData.push([data.details.additionalNotes || "N/A"]);

  const ws = utils.aoa_to_sheet(wsData);

  // Formatting widths
  const wscols = [
    { wch: 25 }, // Col A
    { wch: 25 }, // Col B
    { wch: 25 }, // Col C
    { wch: 25 }, // Col D
  ];
  ws['!cols'] = wscols;

  // Merges for Title and Route Addresses
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Main Title
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }, // Customer
    { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }, // Shipper Header
    { s: { r: 4, c: 2 }, e: { r: 4, c: 3 } }, // Receiver Header
    { s: { r: 5, c: 0 }, e: { r: 5, c: 1 } }, // Shipper Val
    { s: { r: 5, c: 2 }, e: { r: 5, c: 3 } }, // Receiver Val
    { s: { r: 7, c: 0 }, e: { r: 7, c: 3 } }, // Details Header
    { s: { r: 11, c: 0 }, e: { r: 11, c: 3 } }, // Dimensions Header
    { s: { r: 18, c: 0 }, e: { r: 18, c: 3 } }, // Notes Header
    { s: { r: 19, c: 0 }, e: { r: 19, c: 3 } }, // Notes Val
    { s: { r: 10, c: 0 }, e: { r: 10, c: 3 } }, // Appointments
  ];

  utils.book_append_sheet(wb, ws, "Shipment Order");

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  writeFile(wb, `Shipment_Order_${date}_${time}.xlsx`);
};