import type { Metadata } from "next";
import OffersView from "./OffersView";

export const metadata: Metadata = { title: "Offers & Codes" };

export default function OffersPage() {
  return <OffersView />;
}