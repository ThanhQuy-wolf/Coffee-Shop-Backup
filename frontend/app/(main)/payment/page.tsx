import { redirect } from "next/navigation";

// Old address of the checkout page, kept so saved links still work.
export default function PaymentPage() {
  redirect("/checkout");
}
