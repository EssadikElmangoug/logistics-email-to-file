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

export interface ShipmentDetails {
  weightLbs: string;
  dimensions: Dimension[];
  isHazmat: boolean;
  isReeferRequired: boolean;
  appointments: string;
  additionalNotes: string;
  serviceType: ServiceType;
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