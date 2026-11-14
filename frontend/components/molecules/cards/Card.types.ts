export interface ProductCardProps {
  image: string;
  imageAlt?: string;
  productName: string;
  /** A number is formatted as VND; a string is shown as is. */
  price: number | string;
  description: string;
  /** Small tag before the name, e.g. "Combo". */
  badge?: string;
  /** Called when "Mua" is pressed. */
  onBuy?: () => void;
}
