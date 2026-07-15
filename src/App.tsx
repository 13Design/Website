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
import SubscriptionTerms from './pages/SubscriptionTerms';
import { useRoute } from './lib/router';

const TITLES: Record<string, string> = {
  '/': '13 Design Studio — Product design for the AI era',
  '/services': 'Services — 13 Design Studio',
  '/pricing': 'Subscription — 13 Design Studio',
  '/about': 'About — 13 Design Studio',
  '/contact': 'Contact — 13 Design Studio',
  '/work': 'Work — 13 Design Studio',
  '/founding-clients': 'Founding Clients — 13 Design Studio',
  '/subscribe/success': "You're subscribed — 13 Design Studio",
  '/subscribe/cancel': 'Checkout cancelled — 13 Design Studio',
  '/subscription-terms': 'Subscription terms — 13 Design Studio',
};

export default function App() {
  const [route, navigate, params] = useRoute();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.title = TITLES[route] ?? TITLES['/'];
  }, [route]);

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
        {route === '/subscription-terms' && <SubscriptionTerms onNavigate={navigate} />}
      </div>
      <Footer onNavigate={navigate} />
    </div>
  );
}
