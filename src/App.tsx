import { Route, Routes, useLocation } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cursor, EASE, ScrollTop, useLenis } from "./sections/shared";
import Nav from "./sections/Nav";
import Footer from "./sections/Footer";
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Work from "./pages/Work";
import FoundingClients from "./pages/FoundingClients";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

/* curtain wipe on every route change */
function Curtain() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <AnimatePresence>
      <motion.div key={pathname} className="curtain" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.7, delay: 0.05 * i, ease: EASE }}
            style={{ transformOrigin: "top" }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  useLenis();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[130] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-[13px] focus:font-medium focus:text-black"
      >
        Skip to content
      </a>

      <ScrollTop />
      <Cursor />
      <Curtain />
      <div className="grain" aria-hidden="true" />

      <Nav />

      <div id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/work" element={<Work />} />
          <Route path="/founding-clients" element={<FoundingClients />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>

      <Footer />
    </>
  );
}
