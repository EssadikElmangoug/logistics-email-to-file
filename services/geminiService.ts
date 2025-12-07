import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ShipmentData } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

export const extractShipmentData = async (emailText: string): Promise<ShipmentData> => {
  const ai = getClient();

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      shipper: {
        type: Type.OBJECT,
        properties: {
          city: { type: Type.STRING, description: "City of the pickup location" },
          stateOrProvince: { type: Type.STRING, description: "State or Province of the pickup location" },
          postalCode: { type: Type.STRING, description: "Postal/Zip code of the pickup location if available" },
        },
        required: ["city", "stateOrProvince"],
      },
      receiver: {
        type: Type.OBJECT,
        properties: {
          city: { type: Type.STRING, description: "City of the delivery location" },
          stateOrProvince: { type: Type.STRING, description: "State or Province of the delivery location" },
          postalCode: { type: Type.STRING, description: "Postal/Zip code of the delivery location if available" },
        },
        required: ["city", "stateOrProvince"],
      },
      details: {
        type: Type.OBJECT,
        properties: {
          weightLbs: { type: Type.STRING, description: "Total weight of shipment in pounds (lbs). e.g. '45000'" },
          dimensions: { 
            type: Type.ARRAY, 
            description: "List of different package dimensions",
            items: {
              type: Type.OBJECT,
              properties: {
                quantity: { type: Type.STRING, description: "Number of pieces with these dimensions" },
                length: { type: Type.STRING, description: "Length in inches" },
                width: { type: Type.STRING, description: "Width in inches" },
                height: { type: Type.STRING, description: "Height in inches" }
              }
            }
          },
          isHazmat: { type: Type.BOOLEAN, description: "Is the shipment hazardous material?" },
          isReeferRequired: { type: Type.BOOLEAN, description: "Is a refrigerated truck/reefer required?" },
          appointments: { type: Type.STRING, description: "Any specific appointment times for pickup or delivery" },
          additionalNotes: { type: Type.STRING, description: "Any other important notes found in the text" },
          serviceType: { 
            type: Type.STRING, 
            description: "Type of service: FTL (Full Truckload), LTL (Less Than Truckload), Intermodal, Flatbed, Dry Van, Reefer, Step Deck, or Straight Truck. Extract from text or infer based on shipment characteristics.",
            enum: ["FTL", "LTL", "Intermodal", "Flatbed", "Dry Van", "Reefer", "Step Deck", "Straight Truck"]
          },
          shipmentType: {
            type: Type.STRING,
            description: "Type of shipment destination: 'Business to Business' (B2B, commercial) or 'Business to Residential' (B2R, home delivery). Infer from context if not explicitly stated.",
            enum: ["Business to Business", "Business to Residential"]
          },
          receiverType: {
            type: Type.STRING,
            description: "Type of receiver location: 'Business to Business' (B2B, commercial delivery) or 'Business to Residential' (B2R, residential delivery). Infer from delivery address context.",
            enum: ["Business to Business", "Business to Residential"]
          },
          crossBorderStatus: {
            type: Type.STRING,
            description: "Border crossing status: 'Cross Border' (international, crosses country borders), 'Domestic' (within same state/province), or 'Interstate' (crosses state/province lines within same country). Infer from pickup and delivery locations.",
            enum: ["Cross Border", "Domestic", "Interstate"]
          },
          commodity: {
            type: Type.STRING,
            description: "What is being shipped (e.g., 'Electronics', 'Furniture', 'Auto Parts', 'Food Products'). Extract from text or leave empty if not mentioned."
          },
          unNumber: {
            type: Type.STRING,
            description: "UN Number for hazardous materials (e.g., 'UN1203'). Only extract if hazmat is true and UN number is mentioned. Leave empty otherwise."
          },
          equipmentType: {
            type: Type.STRING,
            description: "Required equipment type (e.g., 'Dry Van', 'Flatbed', 'Reefer', 'Step Deck', 'Box Truck', 'Liftgate required'). Extract any equipment requirements mentioned."
          },
          shipmentTiming: {
            type: Type.STRING,
            description: "Shipment readiness: 'Ready Now' (immediate pickup), 'Ready Time' (scheduled pickup time), or 'Future Quote' (quote only, no immediate shipment). Infer from context.",
            enum: ["Ready Now", "Ready Time", "Future Quote"]
          },
          readyTime: {
            type: Type.STRING,
            description: "Specific ready/pickup time if shipmentTiming is 'Ready Time' (e.g., 'Tomorrow 9am', 'Dec 15 2pm'). Leave empty if Ready Now or Future Quote."
          },
          reeferTemperature: {
            type: Type.STRING,
            description: "Required temperature for reefer shipments (e.g., '-10°F', '35-40°F', '2-8°C'). Only extract if service type is Reefer or reefer is required. Leave empty otherwise."
          }
        },
        required: ["weightLbs", "isHazmat", "isReeferRequired", "dimensions", "serviceType", "shipmentType", "receiverType", "crossBorderStatus", "commodity", "equipmentType", "shipmentTiming"],
      },
    },
    required: ["shipper", "receiver", "details"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract the shipment details from the following email text. 
      
      Text:
      """
      ${emailText}
      """
      
      Rules:
      1. Only extract City and State/Province for Shipper and Receiver. Add Postal Code only if clearly present.
      2. Ignore specific street addresses or names.
      3. Extract dimensions carefully. If text says "5 skids 48x40x60 and 2 skids 12x12x12", create two dimension entries. If quantity is implied as 1, set quantity to "1".
      4. If appointments are mentioned (e.g. "Pickup 9am", "Appt required"), include them. If not, leave empty string.
      5. If Hazmat or Reefer is not mentioned, assume false.
      6. Extract the service type (FTL, LTL, Intermodal, Flatbed, Dry Van, Reefer, Step Deck, Straight Truck) from the text. If mentioned explicitly, use that. If not mentioned but reefer is required, use "Reefer". If not mentioned, infer from context (e.g., large weight = FTL, small = LTL). Default to "FTL" if unclear.
      7. For shipmentType: Determine if delivery is to a business (commercial address, warehouse) = "Business to Business" or to a residential address (home) = "Business to Residential". Default to "Business to Business" if unclear.
      8. For crossBorderStatus: If pickup and delivery are in different countries = "Cross Border". If same state/province = "Domestic". If different states/provinces in same country = "Interstate". Default to "Interstate" if unclear.
      9. For commodity: Extract what is being shipped (e.g., "Electronics", "Furniture", "Auto Parts"). Leave empty if not mentioned.
      10. For unNumber: Only extract if hazmat is true and a UN number is mentioned (e.g., "UN1203"). Leave empty otherwise.
      11. For equipmentType: Extract any special equipment requirements mentioned (e.g., "Liftgate required", "Flatbed needed"). Leave empty if not mentioned.
      12. For shipmentTiming: If text mentions "immediate", "ASAP", "ready now" = "Ready Now". If specific date/time mentioned = "Ready Time". If "quote only", "rate request" = "Future Quote". Default to "Ready Now".
      13. For readyTime: Only fill if shipmentTiming is "Ready Time". Extract the specific pickup date/time. Leave empty otherwise.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsedData = JSON.parse(text) as ShipmentData;

    // Safety checks to ensure data structure is valid for UI
    if (!parsedData.details.dimensions) {
        parsedData.details.dimensions = [];
    }
    if (!parsedData.shipper) parsedData.shipper = { city: "", stateOrProvince: "", postalCode: "" };
    if (!parsedData.receiver) parsedData.receiver = { city: "", stateOrProvince: "", postalCode: "" };
    if (!parsedData.customerName) parsedData.customerName = "";
    if (!parsedData.details.serviceType) parsedData.details.serviceType = "FTL";
    
    // Defaults for new fields
    if (!parsedData.details.shipmentType) parsedData.details.shipmentType = "Business to Business";
    if (!parsedData.details.crossBorderStatus) parsedData.details.crossBorderStatus = "Interstate";
    if (!parsedData.details.commodity) parsedData.details.commodity = "";
    if (!parsedData.details.unNumber) parsedData.details.unNumber = "";
    if (!parsedData.details.equipmentType) parsedData.details.equipmentType = "";
    if (!parsedData.details.shipmentTiming) parsedData.details.shipmentTiming = "Ready Now";
    if (!parsedData.details.readyTime) parsedData.details.readyTime = "";
    
    return parsedData;
  } catch (error) {
    console.error("Extraction failed", error);
    throw new Error("Failed to process shipment details.");
  }
};