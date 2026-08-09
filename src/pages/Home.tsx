import Hero from "../sections/Hero";
import WhoWeWorkWith from "../sections/WhoWeWorkWith";
import Services from "../sections/Services";
import Process from "../sections/Process";
import MadeByHumans from "../sections/MadeByHumans";
import WhyItMatters from "../sections/WhyItMatters";
import Faq from "../sections/Faq";
import Cta from "../sections/Cta";

export default function Home() {
  return (
    <main>
      <Hero />
      <WhoWeWorkWith />
      <Services />
      <Process />
      <MadeByHumans />
      <WhyItMatters />
      <Faq />
      <Cta />
    </main>
  );
}
