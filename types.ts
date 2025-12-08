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

export type ServiceType = 'FTL' | 'LTL';

export type EquipmentType = 'Intermodal' | 'Flatbed' | 'Dry Van' | 'Reefer' | 'Step Deck' | 'Straight Truck';

export type ShipmentType = 'Business' | 'Residential';

export type ReceiverType = 'Business' | 'Residential';

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
  receiverType: ReceiverType;
  crossBorderStatus: CrossBorderStatus;
  commodity: string;
  unNumber: string;
  equipmentType: EquipmentType;
  shipmentTiming: ShipmentTiming;
  readyTime: string;
  reeferTemperature: string;
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