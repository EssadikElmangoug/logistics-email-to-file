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
        },
        required: ["weightLbs", "isHazmat", "isReeferRequired", "dimensions", "serviceType"],
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
    
    return parsedData;
  } catch (error) {
    console.error("Extraction failed", error);
    throw new Error("Failed to process shipment details.");
  }
};