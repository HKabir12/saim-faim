const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export const toEnglishDigits = (s: string) =>
  s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

export const bn = (n: number) => n.toLocaleString("bn-BD");

export const taka = (n: number) => `৳ ${bn(n)}`;
