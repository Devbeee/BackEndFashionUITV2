export enum PaymentStatus {
  Paid = 'paid',
  Unpaid = 'unpay',
}
export enum OrderStatus {
  Delivered = 'delivered',
  Delivering = 'delivering',
  Confirmed = 'confirmed',
  Pending = 'pending',
  Canceled = 'canceled',
}

export enum PaymentMethod {
  Banking = 'banking',
  COD = 'cod',
}

export enum SortOptions {
  DateDecrease = 'date-decrease',
  DateIncrease = 'date-increase',
  PriceDecrease = 'price-decrease',
  PriceIncrease = 'price-increase',
  None = 'none',
}
