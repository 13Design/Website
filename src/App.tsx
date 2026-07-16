import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Work from './pages/Work';
import FoundingClients from './pages/FoundingClients';
import SubscribeSuccess from './pages/SubscribeSuccess';
import SubscribeCancel from './pages/SubscribeCancel';
import Terms from './pages/Terms';
import { useRoute } from './lib/router';
import { applyRouteMeta } from './lib/seo';

export default function App() {
  const [route, navigate, params] = useRoute();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const search = params.toString();
  useEffect(() => {
    applyRouteMeta(route, search);
  }, [route, search]);

  return (
    <div
      className={`min-h-screen bg-ink-950 transition-opacity duration-700 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Navbar route={route} onNavigate={navigate} />
      <div key={`${route}${params.toString()}`} className="animate-page-in">
        {route === '/' && <Home onNavigate={navigate} />}
        {route === '/services' && <Services onNavigate={navigate} />}
        {route === '/pricing' && <Pricing onNavigate={navigate} />}
        {route === '/about' && <About onNavigate={navigate} />}
        {route === '/contact' && <Contact onNavigate={navigate} tier={params.get('tier')} />}
        {route === '/work' && <Work onNavigate={navigate} />}
        {route === '/founding-clients' && <FoundingClients onNavigate={navigate} />}
        {route === '/subscribe/success' && (
          <SubscribeSuccess
            onNavigate={navigate}
            tier={params.get('tier')}
            sessionId={params.get('session_id')}
          />
        )}
        {route === '/subscribe/cancel' && (
          <SubscribeCancel onNavigate={navigate} tier={params.get('tier')} />
        )}
        {route === '/terms' && <Terms onNavigate={navigate} />}
      </div>
      <Footer onNavigate={navigate} />
    </div>
  );
}
