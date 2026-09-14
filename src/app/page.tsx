import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BookingWidget from "@/components/BookingWidget";
import FleetLogos from "@/components/FleetLogos";
import Usp from "@/components/Usp";
import Offers from "@/components/Offers";
import Models from "@/components/Models";
import LeaseCalculator from "@/components/LeaseCalculator";
import HowItWorks from "@/components/HowItWorks";
import Showcase from "@/components/Showcase";
import WhyUs from "@/components/WhyUs";
import Testimonial from "@/components/Testimonial";
import Faq from "@/components/Faq";
import CtaFinal from "@/components/CtaFinal";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <TopBar />
      <Header />
      <main>
        <Hero />
        <BookingWidget />
        <FleetLogos />
        <Usp />
        <Offers />
        <Models />
        <LeaseCalculator />
        <HowItWorks />
        <Showcase />
        <WhyUs />
        <Testimonial />
        <Faq />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}