'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, WhatsApp } from './Icons';
import { localities, projectTypes, services, site, timelines, whatsappLink } from '@/lib/site';

const empty = {
  name: '',
  phone: '',
  whatsapp: '',
  email: '',
  locality: '',
  services: [],
  projectType: '',
  area: '',
  timeline: '',
  message: '',
  company: '', // honeypot
};

export default function EnquiryForm() {
  const [form, setForm] = useState(empty);
  const [sameWa, setSameWa] = useState(true);
  const [consent, setConsent] = useState(true);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: 'idle', message: '', reference: '' });
  const mountedAt = useRef(0);
  const formRef = useRef(null);
  const successRef = useRef(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  // Bring validation feedback into view, including errors returned by the server.
  useEffect(() => {
    if (!Object.keys(errors).length) return;
    const field = formRef.current?.querySelector('[aria-invalid="true"], .has-error input, .has-error select, .has-error textarea');
    if (!field) return;
    field.focus({ preventScroll: true });
    field.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'center',
    });
  }, [errors]);

  // Bring the confirmation into view once it replaces the form.
  useEffect(() => {
    if (state.status === 'done') {
      successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      successRef.current?.focus({ preventScroll: true });
    }
  }, [state.status]);

  // Pre-select a service from /contact?service=slug
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('service');
    const s = services.find((x) => x.slug === slug);
    if (s) setForm((f) => ({ ...f, services: [s.title] }));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleService = (title) =>
    setForm((f) => ({
      ...f,
      services: f.services.includes(title) ? f.services.filter((s) => s !== title) : [...f.services, title],
    }));

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Please enter your name.';
    const digits = form.phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    if (!/^[6-9]\d{9}$/.test(digits)) errs.phone = 'Enter a 10-digit mobile number.';
    if (!consent) errs.consent = 'Please allow us to contact you.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setState({ status: 'sending', message: '', reference: '' });
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...form,
          whatsapp: sameWa ? form.phone : form.whatsapp,
          source: window.location.pathname,
          t: Date.now() - mountedAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.error || 'We could not send your request.');
      }
      setState({ status: 'done', message: '', reference: data.reference });
    } catch (err) {
      setState({ status: 'error', message: err.message, reference: '' });
    }
  }

  if (state.status === 'done') {
    return (
      <div className="form-success" role="status" ref={successRef} tabIndex={-1}>
        <span className="label">Request received</span>
        <h2 className="display-3">Thank you, {form.name.split(' ')[0]}.</h2>
        <p className="muted">
          A site engineer will call you on {form.phone} within working hours ({site.hours}). Keep this reference for any follow-up:
        </p>
        <span className="ref">{state.reference}</span>
        <div className="hero-actions">
          <a className="btn btn-dark" href={whatsappLink(`Hello Nirmaan Sena, my enquiry reference is ${state.reference}.`)} target="_blank" rel="noopener noreferrer">
            <WhatsApp size={18} /> Continue on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  const fieldClass = (k, extra = '') => `field${extra ? ` ${extra}` : ''}${errors[k] ? ' has-error' : ''}`;

  return (
    <form ref={formRef} id="enquiry" className="form" onSubmit={submit} noValidate>
      <div className={fieldClass('name')}>
        <label htmlFor="f-name">Full name *</label>
        <input
          id="f-name"
          autoComplete="name"
          value={form.name}
          onChange={set('name')}
          placeholder="Your name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'e-name' : undefined}
        />
        {errors.name ? (
          <span className="field-error" id="e-name">
            {errors.name}
          </span>
        ) : null}
      </div>

      <div className={fieldClass('phone')}>
        <label htmlFor="f-phone">Mobile number *</label>
        <input
          id="f-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={set('phone')}
          placeholder="98XXX XXXXX"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? 'e-phone' : undefined}
        />
        {errors.phone ? (
          <span className="field-error" id="e-phone">
            {errors.phone}
          </span>
        ) : null}
      </div>

      <div className="field field-full">
        <label className="check">
          <input type="checkbox" checked={sameWa} onChange={(e) => setSameWa(e.target.checked)} />
          This number is on WhatsApp — send site photos and the BOQ here.
        </label>
        {!sameWa ? (
          <div className={fieldClass('whatsapp')} style={{ marginTop: 16 }}>
            <label htmlFor="f-wa">WhatsApp number</label>
            <input id="f-wa" type="tel" inputMode="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="98XXX XXXXX" aria-invalid={errors.whatsapp ? true : undefined} aria-describedby={errors.whatsapp ? 'e-whatsapp' : undefined} />
            {errors.whatsapp ? <span className="field-error" id="e-whatsapp">{errors.whatsapp}</span> : null}
          </div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="f-locality">Area in Jaipur</label>
        <select id="f-locality" value={form.locality} onChange={set('locality')}>
          <option value="">Select area</option>
          {localities.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-type">Type of project</label>
        <select id="f-type" value={form.projectType} onChange={set('projectType')}>
          <option value="">Select type</option>
          {projectTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="field field-full">
        <span className="field-label" id="f-services">
          What do you need?
        </span>
        <div className="chips" role="group" aria-labelledby="f-services">
          {services.map((s) => (
            <button key={s.slug} type="button" className="chip" aria-pressed={form.services.includes(s.title)} onClick={() => toggleService(s.title)}>
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="f-area">Plot or built-up area (sq ft)</label>
        <input id="f-area" inputMode="numeric" value={form.area} onChange={set('area')} placeholder="e.g. 1800" />
      </div>

      <div className="field">
        <label htmlFor="f-time">When do you want to start?</label>
        <select id="f-time" value={form.timeline} onChange={set('timeline')}>
          <option value="">Select timeline</option>
          {timelines.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="field field-full">
        <label htmlFor="f-msg">Anything else we should know?</label>
        <textarea id="f-msg" value={form.message} onChange={set('message')} placeholder="Floors, rooms, drawings you already have, budget range…" rows={4} />
      </div>

      <div className={fieldClass('email', 'field-full')}>
        <label htmlFor="f-email">Email (optional)</label>
        <input
          id="f-email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'e-email' : undefined}
        />
        {errors.email ? (
          <span className="field-error" id="e-email">
            {errors.email}
          </span>
        ) : null}
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="f-company">Company</label>
        <input id="f-company" tabIndex={-1} autoComplete="off" value={form.company} onChange={set('company')} />
      </div>

      <div className="field field-full">
        <label className="check">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? 'e-consent' : undefined} />
          I agree to be contacted by Nirmaan Sena by phone and WhatsApp about this enquiry.
        </label>
        {errors.consent ? <span className="field-error" id="e-consent">{errors.consent}</span> : null}
      </div>

      {state.status === 'error' ? (
        <p className="form-alert" role="alert">
          {state.message} You can also call {site.phone} or message us on WhatsApp.
        </p>
      ) : null}

      <div className="form-foot">
        <span className="label">Response within working hours</span>
        <button className="btn" type="submit" disabled={state.status === 'sending'}>
          {state.status === 'sending' ? 'Sending…' : 'Request a site visit'} <ArrowRight />
        </button>
      </div>
    </form>
  );
}
