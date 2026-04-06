import type { Product } from "@/lib/types";

export interface ProductCardProps {
  image: string;
  imageAlt?: string;
  productName: string;
  price: number | string;
  description: string;
  onBuy?: () => void;
}

export interface ShopCardProps {
  id: number;
  name: string;
  address: string;
  image: string;
  onClick?: () => void;
}

export interface PaymentSummaryCardProps {
  totalPrice: number;
  isCustomer: boolean;
  backHref: string;
  onPay?: () => void;
}
