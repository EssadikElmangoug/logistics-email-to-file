export interface Address {
  city: string;
  stateOrProvince: string;
  postalCode: string;
}

export interface Dimension {
  quantity: string;
  length: string;
  width: string;
  height: string;
}

export type ServiceType = 'FTL' | 'LTL' | 'Intermodal' | 'Flatbed' | 'Dry Van' | 'Reefer' | 'Step Deck' | 'Straight Truck';

export type ShipmentType = 'Business to Business' | 'Business to Residential';

export type CrossBorderStatus = 'Cross Border' | 'Domestic' | 'Interstate';

export type ShipmentTiming = 'Ready Now' | 'Ready Time' | 'Future Quote';

export interface ShipmentDetails {
  // Existing fields
  weightLbs: string;
  dimensions: Dimension[];
  isHazmat: boolean;
  isReeferRequired: boolean;
  appointments: string;
  additionalNotes: string;
  serviceType: ServiceType;
  
  // New fields
  shipmentType: ShipmentType;
  crossBorderStatus: CrossBorderStatus;
  commodity: string;
  unNumber: string;
  equipmentType: string;
  shipmentTiming: ShipmentTiming;
  readyTime: string;
}

export interface ShipmentData {
  customerName: string;
  shipper: Address;
  receiver: Address;
  details: ShipmentDetails;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}