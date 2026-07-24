import type { Lang } from './site';

// Real EFT banking details supplied by the church board.
export const BANKING_DETAILS = {
  organisation: 'Sewendedag Adventiste Kerk Tygerberg Gemeente',
  bank: 'ABSA',
  accountNumber: '1450750251',
  branchCode: '632005',
  contactName: 'Adele Meyer',
  contactPhone: '083 415 2908',
};

export const givingCopy: Record<
  Lang,
  {
    accountDetailsLabel: string;
    bankLabel: string;
    accountNumberLabel: string;
    branchCodeLabel: string;
    referenceLabel: string;
    referenceNote: string;
    contactNote: string;
  }
> = {
  af: {
    accountDetailsLabel: 'Bankrekeningbesonderhede',
    bankLabel: 'Bank',
    accountNumberLabel: 'Rekeningnommer',
    branchCodeLabel: 'Tak kode',
    referenceLabel: 'Verwysing',
    referenceNote: 'Naam en beskrywing (bv. tiende)',
    contactNote: `Kontak ${BANKING_DETAILS.contactName} by ${BANKING_DETAILS.contactPhone} vir enige navrae.`,
  },
  en: {
    accountDetailsLabel: 'Banking Details',
    bankLabel: 'Bank',
    accountNumberLabel: 'Account Number',
    branchCodeLabel: 'Branch Code',
    referenceLabel: 'Reference',
    referenceNote: 'Name and description (e.g. tithe)',
    contactNote: `Contact ${BANKING_DETAILS.contactName} at ${BANKING_DETAILS.contactPhone} with any questions.`,
  },
};
