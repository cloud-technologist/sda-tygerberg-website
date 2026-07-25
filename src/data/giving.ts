import type { Lang } from './site';

// Real EFT banking details supplied by the church board.
export const BANKING_DETAILS = {
  organisation: 'Sewendedag Adventiste Kerk Tygerberg Gemeente',
  bank: 'ABSA',
  accountNumber: '1450750251',
  branchCode: '632005',
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
  }
> = {
  af: {
    accountDetailsLabel: 'Bank Besonderhede',
    bankLabel: 'Bank',
    accountNumberLabel: 'Rekeningnommer',
    branchCodeLabel: 'Tak kode',
    referenceLabel: 'Verwysing',
    referenceNote: 'Naam en beskrywing (bv. tiende)',
  },
  en: {
    accountDetailsLabel: 'Banking Details',
    bankLabel: 'Bank',
    accountNumberLabel: 'Account Number',
    branchCodeLabel: 'Branch Code',
    referenceLabel: 'Reference',
    referenceNote: 'Name and description (e.g. tithe)',
  },
};
