export interface Reinsurer {
  id: string;
  entity: string;
  security: number;
  written: number;
  signed: number;
  isLeader: boolean;
}

export interface Party {
  name: string;
  address: string;
  contact: string;
  brokerNumber?: string;
}

export interface Parties {
  client: Party;
  broker: Party;
  reinsurers: Reinsurer[];
}

export interface Instalment {
  id: string;
  no: number;
  dueDate: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
}

export interface Premium {
  currency: string;
  epi: number;
  brokerage: number;
  tax: number;
  paymentTerms: string;
  sddDays: number;
  instalmentFrequency: 'Manual' | 'Monthly' | 'Quarterly' | 'Annually';
  instalments: Instalment[];
}

export interface Reinstatements {
  count: number;
  type: 'Free' | 'Pro-rata' | 'With AP';
  charge: number;
}

export interface Cover {
  type: 'Proportional' | 'Non-Proportional';
  layer: number;
  attachment: number;
  limit: number;
  deductible: number;
  rol: number;
  reinstatements: Reinstatements;
}

export interface Claim {
  id: string;
  fnolDate: string;
  claimRef: string;
  section: string;
  perilCat: string;
  lossDate: string;
  reportedAmount: number;
  reserves: number;
  paid: number;
  recoveries: number;
  notes: string;
}

export interface Compliance {
  sanctionsChecked: boolean;
  screeningReference: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'url' | 'file';
  data: string;
  fileName?: string;
  fileType?: string;
}

export interface Notes {
  contractNotes: string;
}

export interface ExchangeRate {
  id: string;
  from: string;
  to: string;
  rate: number;
}

export interface ReinsuranceContract {
  contractId: string;
  contractTitle: string;
  inOutward: 'Inward' | 'Outward';
  lineOfBusiness: string;
  territory: string;
  inceptionDate: string;
  expiryDate: string;
  governingLaw: string;
  jurisdiction: string;
  parties: Parties;
  premium: Premium;
  cover: Cover;
  claims: Claim[];
  compliance: Compliance;
  attachments: Attachment[];
  notes: Notes;
}