import type { Lang } from './site';

// Real EFT banking details supplied by the church board.
export const BANKING_DETAILS = {
  organisation: 'Sewendedag Adventiste Kerk Tygerberg Gemeente',
  bank: 'ABSA',
  accountNumber: '1450750251',
  branchCode: '632005',
};

/**
 * Zapper, the second giving option.
 *
 * `url` is what the church's Zapper QR encodes — the merchant's own payment
 * link. **Do not guess it.** A wrong value sends people's tithes to a stranger,
 * and unlike a typo in copy nobody would notice until the money was gone. Read
 * it off the QR with a phone camera, or copy it from the Zapper merchant portal.
 *
 * `qr` is a file in `public/images/`, filename only. Optional: with a `url` and
 * no `qr` the page still shows a working pay button, just no code to scan.
 *
 * The whole section hides itself while `url` is empty, so leaving it blank
 * unpublishes Zapper rather than shipping a dead button — same approach as the
 * first-visit answers in homeCopy.ts.
 *
 * Deep linking is why `url` matters more than the image. Zapper publishes both
 * an apple-app-site-association and an assetlinks.json for `zapper.com`, so a
 * plain link opens the app when it is installed, on iOS and Android alike, and
 * falls back to the web page when it is not. A `2.zap.pe/...` link — the older
 * QR format — is a different domain and is not covered by those manifests;
 * check before assuming it deep links.
 */
export const ZAPPER: { url: string; qr: string } = {
  url: '',
  qr: '',
};

export type GivingCopy = {
  backHome: string;
  eyebrow: string;
  heading: string;
  sub: string;
  /** EFT block */
  accountDetailsLabel: string;
  bankLabel: string;
  accountNumberLabel: string;
  branchCodeLabel: string;
  referenceLabel: string;
  referenceNote: string;
  copyLabel: string;
  copiedLabel: string;
  /** Zapper block */
  zapperTitle: string;
  zapperDesc: string;
  zapperCta: string;
  zapperScan: string;
  zapperQrAlt: string;
  /** Closing note */
  thanks: string;
  pageTitle: string;
  /** True whatever is published. The Zapper clause is appended separately. */
  pageDescription: string;
  /** Appended to the description only once Zapper is actually live. */
  pageDescriptionZapper: string;
};

export const givingCopy: Record<Lang, GivingCopy> = {
  af: {
    backHome: 'Terug tuis',
    eyebrow: 'Gee',
    heading: 'Ondersteun die bediening',
    sub: 'Tiendes en offergawes hou die gemeente se bediening aan die gang. Kies wat vir jou die maklikste is.',
    accountDetailsLabel: 'Bank Besonderhede',
    bankLabel: 'Bank',
    accountNumberLabel: 'Rekeningnommer',
    branchCodeLabel: 'Tak kode',
    referenceLabel: 'Verwysing',
    referenceNote: 'Naam en beskrywing (bv. tiende)',
    copyLabel: 'Kopieer rekeningnommer',
    copiedLabel: 'Gekopieer',
    zapperTitle: 'Zapper',
    zapperDesc: 'Betaal met die Zapper-app. Op ’n foon open die knoppie die app as dit reeds geïnstalleer is.',
    zapperCta: 'Gee via Zapper',
    zapperScan: 'Of skandeer met die Zapper-app:',
    zapperQrAlt: 'Zapper QR-kode vir Tygerberg SDA Kerk',
    thanks: 'Baie dankie vir jou getroue ondersteuning.',
    pageTitle: 'Gee · Tygerberg SDA Kerk',
    pageDescription:
      'Ondersteun die bediening van Tygerberg SDA Kerk met ’n tiende of offergawe. Bankbesonderhede vir ’n EFT.',
    pageDescriptionZapper: ' Betaal ook met Zapper.',
  },
  en: {
    backHome: 'Back home',
    eyebrow: 'Give',
    heading: 'Support the ministry',
    sub: 'Tithes and offerings keep the congregation’s ministry going. Use whichever is easiest for you.',
    accountDetailsLabel: 'Banking Details',
    bankLabel: 'Bank',
    accountNumberLabel: 'Account Number',
    branchCodeLabel: 'Branch Code',
    referenceLabel: 'Reference',
    referenceNote: 'Name and description (e.g. tithe)',
    copyLabel: 'Copy account number',
    copiedLabel: 'Copied',
    zapperTitle: 'Zapper',
    zapperDesc: 'Pay with the Zapper app. On a phone the button opens the app if you already have it installed.',
    zapperCta: 'Give via Zapper',
    zapperScan: 'Or scan with the Zapper app:',
    zapperQrAlt: 'Zapper QR code for Tygerberg SDA Church',
    thanks: 'Thank you for your faithful support.',
    pageTitle: 'Give · Tygerberg SDA Church',
    pageDescription:
      'Support the ministry of Tygerberg SDA Church with a tithe or offering. Banking details for an EFT.',
    pageDescriptionZapper: ' You can also pay with Zapper.',
  },
};
