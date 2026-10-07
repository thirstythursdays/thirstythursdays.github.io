import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import logoLarge from './assets/logo.png';
import logoSmall from './assets/logo-small.png';
import {
  defaultContent,
  type Artist,
  type FormConfig,
  type Organization,
  type ThirstyThursdaysContent,
  type TTEvent,
} from './content';
import './thirstythursdays.css';

export type ThirstyThursdaysPageProps = Partial<ThirstyThursdaysContent>;

/* ----------------------------- helpers ----------------------------- */

const ID = {
  about: 'tt-about',
  events: 'tt-events',
  impact: 'tt-impact',
  organizations: 'tt-organizations',
  djs: 'tt-djs',
  involved: 'tt-involved',
  venue: 'tt-venue',
  contact: 'tt-contact',
} as const;

const NAV: { label: string; to: string }[] = [
  { label: 'About', to: ID.about },
  { label: 'Events', to: ID.events },
  { label: 'Organizations', to: ID.organizations },
  { label: 'DJs', to: ID.djs },
  { label: 'Get Involved', to: ID.involved },
  { label: 'Contact', to: ID.contact },
];

type CategoryKey = 'general' | 'organizations' | 'artists' | 'sponsors';

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'organizations', label: 'Organization Partnership' },
  { key: 'artists', label: 'DJ / Performer' },
  { key: 'sponsors', label: 'Sponsorship / Business Partnership' },
];

const HUNDRED_PERCENT =
  '100% of ticket sales and guest donations benefit the featured organization.';

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

function isHttp(url: string) {
  return /^https?:\/\//i.test(url);
}

/* --------------------------- small pieces --------------------------- */

/** In-page link. Scrolls without touching the URL, so it never fights the host app's router. */
function JumpLink(props: {
  to: string;
  className?: string;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  const { to, className, onNavigate, children } = props;
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onNavigate?.();
        scrollToId(to);
      }}
    >
      {children}
    </a>
  );
}

function ExtLink(props: { href: string; className?: string; children: ReactNode }) {
  const { href, className, children } = props;
  const external = isHttp(href);
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

/** Ticket CTA: goes to the Posh page when we have one, otherwise to the events list. */
function TicketButton(props: { event?: TTEvent; className: string; label?: string }) {
  const { event, className, label = 'Get Tickets' } = props;
  if (event?.ticketUrl) {
    return (
      <ExtLink href={event.ticketUrl} className={className}>
        {label}
      </ExtLink>
    );
  }
  return (
    <JumpLink to={ID.events} className={className}>
      {label}
    </JumpLink>
  );
}

function SectionHead(props: { id: string; eyebrow: string; title: string; children?: ReactNode }) {
  const { id, eyebrow, title, children } = props;
  return (
    <header className="tt-head">
      <p className="tt-eyebrow">{eyebrow}</p>
      <h2 id={id} className="tt-h2">
        {title}
      </h2>
      {children}
    </header>
  );
}

function VenueLink({ venue, children }: { venue: ThirstyThursdaysContent['venue']; children?: ReactNode }) {
  return (
    <ExtLink href={venue.url} className="tt-link">
      {children ?? venue.name}
    </ExtLink>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ------------------------------ sections ----------------------------- */

function EventCard({ event }: { event: TTEvent }) {
  const date = parseLocalDate(event.date);
  const org = event.organization;
  if (!org) return null;
  return (
    <article className="tt-event" aria-label={`Thirsty Thursdays on ${formatDate(event.date)}`}>
      <div className="tt-event__date" aria-hidden="true">
        <span className="tt-event__month">
          {date.toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span className="tt-event__day">{date.getDate()}</span>
        <span className="tt-event__year">{date.getFullYear()}</span>
      </div>

      <div className="tt-event__body">
        <p className="tt-event__when">
          {date.toLocaleDateString('en-US', { weekday: 'long' })}, {formatDate(event.date)} ·{' '}
          {formatTime(event.time)}
        </p>
        <h3 className="tt-event__title">Thirsty Thursdays at The Brass Rail</h3>

        <div className="tt-event__org">
          <p className="tt-label">Featured Organization</p>
          <p className="tt-event__orgname">
            {org.url ? (
              <ExtLink href={org.url} className="tt-link tt-link--plain">
                {org.name}
              </ExtLink>
            ) : (
              org.name
            )}
          </p>
          <p className="tt-muted">{org.description}</p>
        </div>

        {event.lineup && event.lineup.length > 0 && (
          <div className="tt-event__lineup">
            <p className="tt-label">Featuring</p>
            <ul className="tt-chips">
              {event.lineup.map((name) => (
                <li key={name} className="tt-chip">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="tt-event__give">
          100% of ticket sales and guest donations from the event benefit <strong>{org.name}</strong>.
        </p>

        <div className="tt-actions">
          <TicketButton event={event} className="tt-btn tt-btn--primary" />
        </div>
      </div>
    </article>
  );
}

function OrgCard({ org }: { org: Organization }) {
  return (
    <article className="tt-card">
      <div className="tt-card__mark" aria-hidden="true">
        {org.name.replace(/[^A-Za-z0-9]/g, '').charAt(0) || '✦'}
      </div>
      <h4 className="tt-card__title">
        {org.url ? (
          <ExtLink href={org.url} className="tt-link tt-link--plain">
            {org.name}
          </ExtLink>
        ) : (
          org.name
        )}
      </h4>
      <p className="tt-muted">{org.description}</p>
      {org.url && (
        <ExtLink href={org.url} className="tt-textcta">
          Visit Their Website <span aria-hidden="true">→</span>
        </ExtLink>
      )}
    </article>
  );
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <article className="tt-card">
      <div className="tt-card__mark tt-card__mark--round" aria-hidden="true">
        {artist.name.replace(/[^A-Za-z0-9]/g, '').charAt(0) || '♪'}
      </div>
      <h4 className="tt-card__title">{artist.name}</h4>
      {artist.bio && <p className="tt-muted">{artist.bio}</p>}
      {artist.links && artist.links.length > 0 && (
        <ul className="tt-sociallinks">
          {artist.links.map((l) => (
            <li key={l.label + l.url}>
              <ExtLink href={l.url} className="tt-textcta">
                {l.label} <span aria-hidden="true">↗</span>
              </ExtLink>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/* ----------------------------- turnstile ----------------------------- */

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
}

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const turnstileApi = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;
let turnstileLoading: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (turnstileApi()) return Promise.resolve();
  turnstileLoading ??= new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = TURNSTILE_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      turnstileLoading = null;
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(el);
  });
  return turnstileLoading;
}

type SendState = 'idle' | 'sending' | 'sent' | 'error';

function ContactSection(props: {
  form: FormConfig;
  category: CategoryKey;
  onCategoryChange: (c: CategoryKey) => void;
}) {
  const { form, category, onCategoryChange } = props;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [trap, setTrap] = useState(''); // honeypot: humans never see this field
  const [token, setToken] = useState('');
  const [state, setState] = useState<SendState>('idle');
  const [notice, setNotice] = useState('');

  const widgetEl = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>('');

  // Render the Turnstile widget once the script is ready; tear it down on unmount.
  useEffect(() => {
    if (!form.turnstileSiteKey || !widgetEl.current) return;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        const api = turnstileApi();
        if (cancelled || !api || !widgetEl.current) return;
        widgetId.current = api.render(widgetEl.current, {
          sitekey: form.turnstileSiteKey,
          theme: 'dark',
          action: 'turnstile-spin-v1',
          callback: (t: string) => setToken(t),
          'expired-callback': () => setToken(''),
          'error-callback': () => setToken(''),
        });
      })
      .catch(() => {
        if (!cancelled) setNotice('Verification couldn’t load. Please refresh and try again.');
      });
    return () => {
      cancelled = true;
      if (widgetId.current) turnstileApi()?.remove(widgetId.current);
      widgetId.current = '';
    };
  }, [form.turnstileSiteKey]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    if (!form.endpoint || !form.turnstileSiteKey) {
      setState('error');
      setNotice('The contact form isn’t set up yet.');
      return;
    }
    if (!token) {
      setState('error');
      setNotice('Please complete the verification below, then send.');
      return;
    }
    setState('sending');
    setNotice('');
    try {
      const res = await fetch(form.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: CATEGORIES.find((c) => c.key === category)?.label ?? 'General',
          name,
          email,
          message,
          website: trap,
          token,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setState('sent');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setState('error');
        setNotice(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setState('error');
      setNotice('We couldn’t reach the server. Please check your connection and try again.');
    }
    // Turnstile tokens are single-use.
    setToken('');
    if (widgetId.current) turnstileApi()?.reset(widgetId.current);
  }

  return (
    <section className="tt-section tt-section--alt" aria-labelledby={ID.contact}>
      <div className="tt-wrap">
        <SectionHead id={ID.contact} eyebrow="Contact Us" title="Let’s Connect">
          <p className="tt-lead">
            Have a question, want to partner with us, or interested in getting involved? Send us a
            message.
          </p>
        </SectionHead>

        <div className="tt-contact">
          <form className="tt-form" onSubmit={onSubmit}>
            <div className="tt-field">
              <label htmlFor="tt-f-category">What’s this about?</label>
              <select
                id="tt-f-category"
                value={category}
                onChange={(e) => onCategoryChange(e.target.value as CategoryKey)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="tt-field-row">
              <div className="tt-field">
                <label htmlFor="tt-f-name">Name</label>
                <input
                  id="tt-f-name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="tt-field">
                <label htmlFor="tt-f-email">Email</label>
                <input
                  id="tt-f-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={200}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="tt-field">
              <label htmlFor="tt-f-message">Message</label>
              <textarea
                id="tt-f-message"
                rows={6}
                required
                maxLength={5000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
            <div className="tt-hp" aria-hidden="true">
              <label htmlFor="tt-f-website">Website</label>
              <input
                id="tt-f-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
              />
            </div>

            <div ref={widgetEl} className="tt-turnstile" />

            <div className="tt-actions">
              <button type="submit" className="tt-btn tt-btn--primary" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </div>
            <p
              className={`tt-form__note${state === 'sent' ? ' tt-form__note--ok' : ''}${state === 'error' ? ' tt-form__note--err' : ''}`}
              role="status"
            >
              {state === 'sent'
                ? 'Thanks! Your message is on its way. We’ll get back to you soon.'
                : notice}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- page ------------------------------- */

export function ThirstyThursdaysPage(props: ThirstyThursdaysPageProps) {
  const content: ThirstyThursdaysContent = { ...defaultContent, ...props };
  const { venue, organizations, artists, impact, contact, form, showImpact, copyrightYear } = content;

  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<CategoryKey>('general');

  // Upcoming = today or later. Past events drop off automatically.
  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return content.events
      .filter((e) => parseLocalDate(e.date) >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [content.events]);

  const next = upcoming[0];
  const announced = upcoming.filter((e) => e.organization);
  const comingSoon = upcoming.filter((e) => !e.organization);

  const closeMenu = () => setMenuOpen(false);
  const goContact = (c: CategoryKey) => {
    setCategory(c);
    scrollToId(ID.contact);
  };

  return (
    <div className="tt-root">
      {/* ------------------------------ nav ------------------------------ */}
      <nav className="tt-nav" aria-label="Thirsty Thursdays">
        <div className="tt-nav__inner">
          <JumpLink to="tt-top" className="tt-nav__brand" onNavigate={closeMenu}>
            <img src={logoSmall} alt="Thirsty Thursdays" width={180} height={112} />
          </JumpLink>

          <ul className="tt-nav__links" data-open={menuOpen} id="tt-nav-links">
            {NAV.map((n) => (
              <li key={n.to}>
                <JumpLink to={n.to} className="tt-nav__link" onNavigate={closeMenu}>
                  {n.label}
                </JumpLink>
              </li>
            ))}
          </ul>

          <div className="tt-nav__actions">
            <ExtLink href={contact.instagramUrl} className="tt-nav__icon">
              <InstagramIcon />
              <span className="tt-sr">Thirsty Thursdays on Instagram</span>
            </ExtLink>
            <TicketButton event={next} className="tt-btn tt-btn--primary tt-btn--small" />
            <button
              type="button"
              className="tt-nav__toggle"
              aria-expanded={menuOpen}
              aria-controls="tt-nav-links"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="tt-sr">Menu</span>
              <span className="tt-nav__bars" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      <main id="tt-top">
        {/* ------------------------------ hero ----------------------------- */}
        <section className="tt-hero">
          <div className="tt-wrap tt-hero__inner">
            <h1 className="tt-hero__logo">
              <img
                src={logoLarge}
                alt="Thirsty Thursdays at the Brass Rail"
                width={1000}
                height={620}
              />
            </h1>
            <p className="tt-hero__tag">Music. Community. Impact.</p>
            <p className="tt-hero__lead">
              A monthly night at <VenueLink venue={venue} /> bringing together DJs, performers,
              local LGBTQIA+ organizations, and the San Diego community to have a great time while
              supporting causes that matter.
            </p>
            <p className="tt-hero__give">{HUNDRED_PERCENT}</p>

            <p className="tt-hero__next">
              <span className="tt-label">Next Event</span>
              {next ? (
                <span className="tt-hero__nextwhen">
                  {formatDate(next.date)} · {formatTime(next.time)}
                </span>
              ) : (
                <span className="tt-hero__nextwhen">Coming soon</span>
              )}
            </p>

            <div className="tt-actions tt-actions--center">
              <TicketButton event={next} className="tt-btn tt-btn--primary" />
              <JumpLink to={ID.about} className="tt-btn tt-btn--ghost">
                Learn More
              </JumpLink>
            </div>
          </div>
        </section>

        {/* ------------------------------ about ---------------------------- */}
        <section className="tt-section" aria-labelledby={ID.about}>
          <div className="tt-wrap tt-about">
            <div>
              <SectionHead id={ID.about} eyebrow="About Us" title="A Night Out That Gives Back" />
              <div className="tt-prose">
                <p>
                  Thirsty Thursdays was created around a simple idea: nightlife can be more than
                  entertainment. It can also bring people together, introduce them to organizations
                  doing meaningful work, and turn a night out into direct community support.
                </p>
                <p>
                  Each month, we partner with a local LGBTQIA+ nonprofit or community organization and bring
                  people together at <VenueLink venue={venue} /> for a night of music, connection,
                  and giving.
                </p>
                <p>
                  The featured organization is invited to be part of the event, share its mission
                  with guests, and connect directly with the community. DJs and performers donate
                  their time and talent, and{' '}
                  <strong>
                    100% of ticket sales and guest donations go to the featured organization.
                  </strong>
                </p>
                <p>
                  Our goal is to create something that is fun first, meaningful by design, and
                  capable of making a real impact month after month.
                </p>
              </div>
              <div className="tt-actions">
                <ExtLink href={venue.url} className="tt-btn tt-btn--ghost">
                  Learn About The Brass Rail
                </ExtLink>
              </div>
            </div>

            <aside className="tt-bigstat" aria-label="Where the money goes">
              <p className="tt-bigstat__num">100%</p>
              <p className="tt-bigstat__text">
                of ticket sales and guest donations go to the featured organization.
              </p>
            </aside>
          </div>
        </section>

        {/* ----------------------------- events ---------------------------- */}
        <section className="tt-section tt-section--alt" aria-labelledby={ID.events}>
          <div className="tt-wrap">
            <SectionHead id={ID.events} eyebrow="Upcoming Events" title="Upcoming Events">
              <p className="tt-lead">
                Come out, meet the people behind great local organizations, hear some of San Diego’s
                DJs and performers, and support a different cause each month.
              </p>
            </SectionHead>

            {announced.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}

            {comingSoon.length > 0 && (
              <div className="tt-future">
                <h3 className="tt-h3">Future Events</h3>
                <ul className="tt-future__list">
                  {comingSoon.map((ev) => (
                    <li key={ev.id} className="tt-future__item">
                      <span className="tt-future__date">{formatDate(ev.date)}</span>
                      <span className="tt-muted">Featured organization and lineup coming soon.</span>
                    </li>
                  ))}
                </ul>
                <p className="tt-muted">
                  Follow us for new event announcements, featured organizations, and artist
                  lineups.
                </p>
                <div className="tt-actions">
                  <ExtLink href={contact.instagramUrl} className="tt-btn tt-btn--ghost">
                    Follow Thirsty Thursdays
                  </ExtLink>
                </div>
              </div>
            )}

            {upcoming.length === 0 && (
              <p className="tt-muted">New dates are on the way. Follow us to be the first to know.</p>
            )}
          </div>
        </section>

        {/* ----------------------------- impact ---------------------------- */}
        {showImpact && (
          <section className="tt-section" aria-labelledby={ID.impact}>
            <div className="tt-wrap">
              <SectionHead id={ID.impact} eyebrow="Our Impact" title="Good Nights. Real Impact.">
                <p className="tt-lead">
                  Every Thirsty Thursday is designed to turn community participation into tangible
                  support for organizations doing important work.
                </p>
              </SectionHead>
              <dl className="tt-stats">
                {[
                  [impact.raised, 'Raised'],
                  [impact.organizations, 'Organizations Supported'],
                  [impact.events, 'Events'],
                  [impact.guests, 'Guests'],
                ].map(([value, label]) => (
                  <div key={label} className="tt-stat">
                    <dt className="tt-stat__label">{label}</dt>
                    <dd className="tt-stat__value">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="tt-center tt-muted">And we’re just getting started.</p>
            </div>
          </section>
        )}

        {/* -------------------------- organizations ------------------------ */}
        <section className="tt-section" aria-labelledby={ID.organizations}>
          <div className="tt-wrap">
            <SectionHead
              id={ID.organizations}
              eyebrow="Organizations We Support"
              title="Organizations We Support"
            >
              <p className="tt-lead">
                Thirsty Thursdays exists to amplify organizations that serve, strengthen, and
                support our community.
              </p>
              <p className="tt-lead">
                Each month, we feature a different organization and give them an opportunity to
                introduce their work to new people, connect directly with attendees, and receive{' '}
                <strong>100% of the event’s ticket sales and guest donations.</strong>
              </p>
            </SectionHead>

            <h3 className="tt-h3">Featured Partners</h3>
            <div className="tt-grid">
              {organizations.map((o, i) => (
                <OrgCard key={o.name + i} org={o} />
              ))}
            </div>

            <div className="tt-band">
              <div>
                <h3 className="tt-h3 tt-h3--flush">Want Your Organization Featured?</h3>
                <p className="tt-muted">
                  If you represent a nonprofit or community organization and would like to be
                  considered for a future Thirsty Thursday, we’d love to hear from you.
                </p>
              </div>
              <button
                type="button"
                className="tt-btn tt-btn--primary"
                onClick={() => goContact('organizations')}
              >
                Partner With Us
              </button>
            </div>
          </div>
        </section>

        {/* ------------------------------- djs ----------------------------- */}
        <section className="tt-section tt-section--alt" aria-labelledby={ID.djs}>
          <div className="tt-wrap">
            <SectionHead id={ID.djs} eyebrow="DJs & Performers" title="DJs & Performers">
              <p className="tt-lead">The music is a huge part of what makes Thirsty Thursdays work.</p>
              <p className="tt-lead">
                We partner with DJs and performers who want to bring people together, create an
                unforgettable night, and use their talent to support organizations doing meaningful
                work in our community.
              </p>
              <p className="tt-lead">
                Our artists donate their performance time to the event, helping ensure that ticket
                proceeds can go directly to the featured organization.
              </p>
            </SectionHead>

            <h3 className="tt-h3">Featured Artists</h3>
            <div className="tt-grid">
              {artists.map((a, i) => (
                <ArtistCard key={a.name + i} artist={a} />
              ))}
            </div>

            <div className="tt-band">
              <div>
                <h3 className="tt-h3 tt-h3--flush">Interested in Performing?</h3>
                <p className="tt-muted">
                  We’re always interested in meeting DJs and performers who believe in what we’re
                  building and want to be part of a future event.
                </p>
              </div>
              <button
                type="button"
                className="tt-btn tt-btn--primary"
                onClick={() => goContact('artists')}
              >
                Perform With Us
              </button>
            </div>
          </div>
        </section>

        {/* ---------------------------- get involved ----------------------- */}
        <section className="tt-section" aria-labelledby={ID.involved}>
          <div className="tt-wrap">
            <SectionHead id={ID.involved} eyebrow="Get Involved" title="Get Involved">
              <p className="tt-lead">There are a lot of ways to be part of Thirsty Thursdays.</p>
            </SectionHead>

            <div className="tt-grid tt-grid--2">
              <article className="tt-card tt-card--accent">
                <h3 className="tt-card__title">Attend an Event</h3>
                <p className="tt-muted">
                  Come out, bring your friends, meet new people, hear great music, and support a
                  local organization in the process.
                </p>
                <JumpLink to={ID.events} className="tt-textcta">
                  See Upcoming Events <span aria-hidden="true">→</span>
                </JumpLink>
              </article>

              <article className="tt-card tt-card--accent">
                <h3 className="tt-card__title">Partner With Us</h3>
                <p className="tt-muted">
                  Are you part of a nonprofit or community organization doing meaningful work in San
                  Diego? Tell us about your organization and why you’d like to be featured.
                </p>
                <button type="button" className="tt-textcta" onClick={() => goContact('organizations')}>
                  Organization Inquiries <span aria-hidden="true">→</span>
                </button>
              </article>

              <article className="tt-card tt-card--accent">
                <h3 className="tt-card__title">Perform With Us</h3>
                <p className="tt-muted">
                  If you’re a DJ or performer who wants to donate your time and talent to a great
                  cause, we’d love to connect.
                </p>
                <button type="button" className="tt-textcta" onClick={() => goContact('artists')}>
                  Artist Inquiries <span aria-hidden="true">→</span>
                </button>
              </article>

              <article className="tt-card tt-card--accent">
                <h3 className="tt-card__title">Sponsor or Support an Event</h3>
                <p className="tt-muted">
                  Businesses, brands, and community partners can help us expand each event’s reach
                  and increase the impact we’re able to create for the featured organization.
                </p>
                <p className="tt-muted">
                  If you’re interested in sponsoring, donating, or finding another way to support
                  Thirsty Thursdays, get in touch.
                </p>
                <button type="button" className="tt-textcta" onClick={() => goContact('sponsors')}>
                  Sponsorship &amp; Partnership Inquiries <span aria-hidden="true">→</span>
                </button>
              </article>
            </div>
          </div>
        </section>

        {/* ------------------------------ venue ---------------------------- */}
        <section className="tt-section tt-section--alt" aria-labelledby={ID.venue}>
          <div className="tt-wrap tt-venue">
            <div>
              <SectionHead id={ID.venue} eyebrow="The Venue" title="Home at The Brass Rail" />
              <div className="tt-prose">
                <p>
                  Thirsty Thursdays takes place at <VenueLink venue={venue} />, one of San Diego’s
                  longstanding LGBTQ+ nightlife destinations.
                </p>
                <p>
                  We’re proud to call The Rail home and to create a recurring night where nightlife,
                  community, music, and local organizations can come together under one roof.
                </p>
              </div>
            </div>

            <address className="tt-address">
              <p className="tt-address__name">{venue.name}</p>
              {venue.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <div className="tt-actions">
                <ExtLink href={venue.url} className="tt-btn tt-btn--ghost">
                  Visit The Brass Rail
                </ExtLink>
              </div>
            </address>
          </div>
        </section>

        {/* ----------------------------- contact --------------------------- */}
        <ContactSection form={form} category={category} onCategoryChange={setCategory} />
      </main>

      {/* ------------------------------ footer ----------------------------- */}
      <footer className="tt-footer">
        <div className="tt-wrap tt-footer__inner">
          <img src={logoSmall} alt="" className="tt-footer__logo" width={180} height={112} />
          <p className="tt-footer__name">Thirsty Thursdays</p>
          <p className="tt-footer__tag">Music. Community. Impact.</p>
          <p className="tt-muted">
            A monthly community event at <VenueLink venue={venue} /> in San Diego.
          </p>
          <p className="tt-footer__give">
            100% of ticket sales and guest donations benefit each event’s featured organization.
          </p>
          <ul className="tt-footer__links">
            <li>
              <ExtLink href={contact.instagramUrl} className="tt-link">
                Instagram
              </ExtLink>
            </li>
            <li>
              <JumpLink to={ID.contact} className="tt-link">
                Contact
              </JumpLink>
            </li>
            <li>
              <VenueLink venue={venue} />
            </li>
          </ul>
          <p className="tt-footer__copy">© {copyrightYear} Thirsty Thursdays. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ThirstyThursdaysPage;
