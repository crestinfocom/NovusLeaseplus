import "./site.css";
import { StoreProvider } from "@/lib/site-store";
import TopBar from "./_components/TopBar";
import Header from "./_components/Header";
import Footer from "./_components/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StoreProvider>
        <TopBar />
        <Header />
        <main id="app-wrap">{children}</main>
        <Footer />
      </StoreProvider>
    </>
  );
}