import Hero from "@/components/hero/Hero";
import Manifesto from "@/components/manifesto/Manifesto";
import Showcase from "@/components/showcase/Showcase";
import Events from "@/components/events/Events";
import Waitlist from "@/components/waitlist/Waitlist";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <Showcase />
      <Events />
      <Waitlist />
      <Footer />
    </main>
  );
}
