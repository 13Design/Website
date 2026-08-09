import Hero from "../sections/Hero";
import WhoWeWorkWith from "../sections/WhoWeWorkWith";
import Services from "../sections/Services";
import Process from "../sections/Process";
import MadeByHumans from "../sections/MadeByHumans";
import WhyItMatters from "../sections/WhyItMatters";
import Faq from "../sections/Faq";
import Cta from "../sections/Cta";
import { useHead } from "../lib/head";

export default function Home() {
  useHead({
    description:
      "A digital product design studio for the AI era. We turn AI-native features and AI-generated MVPs into products people trust and understand at first glance.",
  });
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
