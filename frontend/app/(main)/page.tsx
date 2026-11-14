import { redirect } from "next/navigation";

// The platform has many shops, so the home page is the shop list (UC-03).
// Each shop's menu lives at /shops/[shopId].
export default function Home() {
  redirect("/feed");
}
