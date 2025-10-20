import { ReinsuranceContract, ExchangeRate } from "./types";
import { v4 as uuidv4 } from 'uuid';

export const HARD_CURRENCIES = [
  { code: 'USD', name: 'United States Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'GBP', name: 'British Pound Sterling' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'DKK', name: 'Danish Krone' },
];

export const LINES_OF_BUSINESS = [
  'Property',
  'Casualty',
  'Marine',
  'Aviation',
  'Energy',
  'Cyber',
  'Political Risk',
  'Credit & Surety',
  'Other',
];

export const SECTIONS = [
    'Dashboard',
    'Overview',
    'Parties',
    'Cover',
    'Premium',
    'Claims',
    'Attachments',
    'Compliance',
    'Notes',
    'Exchange Rates',
    'Preview',
];

export const INITIAL_RATES: ExchangeRate[] = [
    { id: '1', from: 'EUR', to: 'USD', rate: 1.08 },
    { id: '2', from: 'GBP', to: 'USD', rate: 1.27 },
    { id: '3', from: 'JPY', to: 'USD', rate: 0.0064 },
];

export const generateContractId = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const threeLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const fiveNumbers = Math.floor(10000 + Math.random() * 90000).toString();
  const year = new Date().getFullYear().toString().slice(-2);
  return `${threeLetters}${fiveNumbers}${year}`;
};

export const generateBlankContract = (): ReinsuranceContract => {
  const newId = generateContractId();
  return {
    contractId: newId,
    contractTitle: 'Untitled Contract',
    inOutward: 'Inward',
    lineOfBusiness: 'Property',
    territory: '',
    inceptionDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    governingLaw: 'English Law',
    jurisdiction: 'England and Wales',
    parties: {
      client: { name: '', address: '', contact: '' },
      broker: { name: '', address: '', contact: '', brokerNumber: '' },
      reinsurers: [],
    },
    premium: {
      currency: 'USD',
      epi: 0,
      brokerage: 10,
      tax: 0,
      paymentTerms: 'Quarterly',
      sddDays: 30,
      instalmentFrequency: 'Manual',
      instalments: [],
    },
    cover: {
      type: 'Non-Proportional',
      layer: 0,
      attachment: 0,
      limit: 0,
      deductible: 0,
      rol: 0,
      reinstatements: { count: 1, type: 'Free', charge: 0 },
    },
    claims: [],
    compliance: { sanctionsChecked: false, screeningReference: '' },
    attachments: [],
    notes: { contractNotes: '' },
  };
};
