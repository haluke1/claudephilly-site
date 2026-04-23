import Hero from "@/components/hero/Hero";
import Manifesto from "@/components/manifesto/Manifesto";
import Showcase from "@/components/showcase/Showcase";
import Events from "@/components/events/Events";
import Waitlist from "@/components/waitlist/Waitlist";
import Footer from "@/components/footer/Footer";
import ScrollProgress from "@/components/shared/ScrollProgress";
import Navbar from "@/components/shared/Navbar";
import SectionTransition from "@/components/shared/SectionTransition";
import WorkHoursBadge from "@/components/shared/WorkHoursBadge";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <SectionTransition from="#0F172A" to="#0C1524" />
        <Manifesto />
        <SectionTransition from="#0C1524" to="#0F172A" />
        <Showcase />
        <SectionTransition from="#0F172A" to="#111827" />
        <Events />
        <SectionTransition from="#111827" to="#0F172A" />
        <Waitlist />
      </main>
      <Footer />
      <WorkHoursBadge />
    </>
  );
}
