export interface ProductCardProps {
  image: string;
  imageAlt?: string;
  productName: string;
  price: number | string;
  description: string;
  /** e.g. "Combo" */
  badge?: string;
  onBuy?: () => void;
}

export interface ShopCardProps {
  id: number;
  name: string;
  address: string;
  image: string;
  onClick?: () => void;
}
