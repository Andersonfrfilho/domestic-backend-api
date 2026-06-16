export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

export type PixDetails = {
  pixKeyType: PixKeyType;
  pixKey: string;
};

export type BankTransferDetails = {
  bank: string;
  agency: string;
  account: string;
  accountType: 'checking' | 'savings';
};

export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'hipercard' | 'amex';

export type CardDetails = {
  acceptedBrands: CardBrand[];
};

export type PaymentMethodDetails = PixDetails | BankTransferDetails | CardDetails;

export function isPixDetails(details: PaymentMethodDetails): details is PixDetails {
  return 'pixKey' in details;
}

export function isBankTransferDetails(
  details: PaymentMethodDetails,
): details is BankTransferDetails {
  return 'agency' in details;
}

export function isCardDetails(details: PaymentMethodDetails): details is CardDetails {
  return 'acceptedBrands' in details;
}
