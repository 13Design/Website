import { Link } from "react-router";
import { ArrowUpRight, KGrain, Magnetic, Reveal } from "../sections/shared";
import { useHead } from "../lib/head";

export default function NotFound() {
  useHead({
    title: "Page not found",
    description: "The page you're looking for doesn't exist or has moved.",
  });

  return (
    <main className="relative flex min-h-[100svh] items-center overflow-hidden">
      <KGrain />
      <div aria-hidden="true" className="v-grid pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="text-outline pointer-events-none absolute -right-10 top-10 select-none font-display text-[42vw] font-semibold leading-none tracking-tighter lg:text-[26vw]"
      >
        404
      </div>

      <div className="relative z-[4] mx-auto w-full max-w-[1440px] px-5 pt-28 sm:px-8 lg:px-12">
        <Reveal>
          <p className="font-mono2 mb-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.28em] text-black/50">
            <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 rounded-full bg-black" />
            Error 404
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="font-display max-w-[16ch] text-[clamp(2.6rem,8vw,6.5rem)] font-medium leading-[0.96] tracking-[-0.045em]">
            This page went <em className="font-light italic text-black/50">missing.</em>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-8 max-w-[46ch] text-[17px] leading-[1.65] text-black/60">
            The page you're after doesn't exist or has moved. Let's get you back to something real.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic strength={0.22}>
              <Link
                to="/"
                className="group inline-flex items-center gap-3 rounded-full border border-black bg-black px-7 py-3.5 text-[14px] font-medium text-white transition-colors duration-300 hover:bg-transparent hover:text-black"
              >
                Back to home
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>
            <Link
              to="/contact"
              className="link-line font-mono2 text-[12px] uppercase tracking-[0.2em] text-black/55 hover:text-black"
            >
              Contact us →
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
