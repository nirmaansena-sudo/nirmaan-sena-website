import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import MotionRoot from '@/components/site/MotionRoot';
import SiteNotFound from './(site)/not-found';

// Shown for any URL that doesn't match a page.
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main">
        <SiteNotFound />
      </main>
      <Footer />
      <MotionRoot />
    </>
  );
}
