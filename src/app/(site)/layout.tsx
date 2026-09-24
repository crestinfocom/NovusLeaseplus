import "./site.css";
import { StoreProvider } from "@/lib/site-store";
import TopBar from "./_components/TopBar";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import OfflineNotice from "./_components/OfflineNotice";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#app-wrap">
        Skip to content
      </a>
      <StoreProvider>
        <TopBar />
        <Header />
        <OfflineNotice />
        <main id="app-wrap">{children}</main>
        <Footer />
      </StoreProvider>
    </>
  );
}