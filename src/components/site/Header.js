'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Brand } from './Logo';
import { ArrowRight, Phone } from './Icons';
import { nav, site, whatsappLink } from '@/lib/site';

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const toggleRef = useRef(null);
  const callRef = useRef(null);
  const menuRef = useRef(null);
  const disclosureRef = useRef(null);
  const close = () => {
    if (disclosureRef.current) disclosureRef.current.open = false;
    setOpen(false);
  };

  // Keep phone navigation available; only hide the desktop header on scroll.
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 1100px)');
    let ticking = false;
    let frame;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        if (mobile.matches || open || y < 120) setHidden(false);
        else if (delta > 6) setHidden(true);
        else if (delta < -6) setHidden(false);
        lastY.current = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle('header-visible', !hidden || open);
    return () => document.body.classList.remove('header-visible');
  }, [hidden, open]);

  // Close the menu on navigation.
  useEffect(() => {
    close();
    setHidden(false);
    lastY.current = window.scrollY;
  }, [pathname]);

  // A rotated phone or resized window must not leave the desktop page scroll-locked.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1101px)');
    const onChange = () => {
      setHidden(false);
      if (desktop.matches) close();
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  // Lock scrolling, move focus into the menu, and keep Tab inside it while open.
  useEffect(() => {
    if (!open) return;
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const background = [...document.querySelectorAll('main, .site-footer, .wa-float')];
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    const toggle = toggleRef.current;
    const first = menuRef.current?.querySelector('a');
    if (menuRef.current) menuRef.current.scrollTop = 0;
    const frame = requestAnimationFrame(() => first?.focus({ preventScroll: true }));
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab' || !menuRef.current) return;
      const items = [callRef.current, toggle, ...menuRef.current.querySelectorAll('a')].filter(Boolean);
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (!e.shiftKey && i === items.length - 1) {
        e.preventDefault();
        items[0].focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      toggle?.focus({ preventScroll: true });
    };
  }, [open]);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className={`site-header${hidden && !open ? ' is-hidden' : ''}${open ? ' menu-open' : ''}`}>
        <div className="container inner">
          <Brand onClick={close} />
          <nav className="main-nav" aria-label="Main">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <a ref={callRef} className="header-phone header-phone--icon" href={site.phoneHref} aria-label={`Call Nirmaan Sena on ${site.phone}`} title={`Call ${site.phone}`}>
              <Phone size={19} />
            </a>
            <Link href="/contact" className="btn btn-sm btn-dark">
              Start a project <ArrowRight />
            </Link>
            {/* Native disclosure keeps navigation usable before JavaScript loads. */}
            <details ref={disclosureRef} className="mobile-navigation" onToggle={(event) => setOpen(event.currentTarget.open)}>
              <summary ref={toggleRef} className="menu-toggle" aria-label="Navigation menu" aria-controls="mobile-menu">
                <span className="menu-toggle-label" aria-hidden="true"><span className="menu-label-open">Menu</span><span className="menu-label-close">Close</span></span>
                <span className="menu-toggle-icon" aria-hidden="true"><span /><span /></span>
              </summary>
              <div className="mobile-menu-shell">
                <button className="mobile-menu-backdrop" type="button" tabIndex={-1} onClick={close} aria-label="Close navigation menu" />
                <div ref={menuRef} id="mobile-menu" className="mobile-menu">
                  <span className="label mobile-menu-eyebrow">Explore Nirmaan Sena</span>
                  <nav aria-label="Mobile">
                    {[{ href: '/', label: 'Home' }, ...nav].map((item, i) => (
                      <Link key={item.href} href={item.href} onClick={close} aria-current={isActive(item.href) ? 'page' : undefined}>
                        <span>{item.label}</span><ArrowRight size={20} /><small>0{i}</small>
                      </Link>
                    ))}
                  </nav>
                  <div className="mobile-menu-foot">
                    <p>{site.address.line1}<br />{site.address.line2}</p>
                    <Link href="/contact" className="btn btn-on-dark btn-block" onClick={close}>Start a project <ArrowRight /></Link>
                    <a className="btn btn-outline-dark btn-block" href={whatsappLink()} target="_blank" rel="noopener noreferrer" onClick={close}>WhatsApp <ArrowRight /></a>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>
      <div className="mobile-header-spacer" aria-hidden="true" />
    </>
  );
}
