export enum PaymentStatus {
  Paid = 'paid',
  Unpaid = 'unpay',
}

export enum VerifyPaymentStatus {
  Failed = 'failed',
  Success = 'success',
}

export enum OrderStatus {
  Delivered = 'delivered',
  Delivering = 'delivering',
  Confirmed = 'confirmed',
  Pending = 'pending',
  Canceled = 'canceled',
}

export enum PaymentMethod {
  Stripe = 'stripe',
  COD = 'cod',
}

export enum SortOptions {
  DateDecrease = 'date-decrease',
  DateIncrease = 'date-increase',
  PriceDecrease = 'price-decrease',
  PriceIncrease = 'price-increase',
  None = 'none',
}

export enum FilterOptions {
  Delivered = 'delivered',
  Delivering = 'delivering',
  Confirmed = 'confirmed',
  Pending = 'pending',
  Canceled = 'canceled',
  None = 'none',
}
