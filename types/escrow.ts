export interface EscrowInput {
  itemName: string;
  priceUSDC: string;
  description: string;
  shippingWindow: string;
}

export interface EscrowResponse {
  url: string;
}
