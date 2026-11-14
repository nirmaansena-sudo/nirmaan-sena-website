import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import MotionRoot from '@/components/site/MotionRoot';
import { WhatsAppFloat } from '@/components/site/Blocks';
import '../home-editorial.css';

export default function SiteLayout({ children }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <MotionRoot />
    </>
  );
}
