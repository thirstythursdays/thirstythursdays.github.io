import fiveAmClub from './assets/5amclub.jpg';
import flyerPlaceholder from './assets/flyer-placeholder.svg';

// All editable content lives here (or is passed in as props), so events,
// organizations, and artists can be added without touching the page structure.
// Values in [brackets] are placeholders from the copy doc awaiting real info.

export interface Organization {
  name: string;
  description: string;
  url?: string;
}

export interface ArtistLink {
  label: string;
  url: string;
}

export interface Artist {
  name: string;
  bio?: string;
  /** Square-ish photo URL (imported asset or hosted). Falls back to an initial if unset. */
  image?: string;
  links?: ArtistLink[];
}

export interface TTEvent {
  id: string;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  /** 24h local time, HH:mm. */
  time: string;
  /** Posh event page. */
  ticketUrl?: string;
  /** Event flyer, shown in the hero while this is the next event. Clicking it goes to `ticketUrl`. Portrait (4:5) or square both work. */
  flyer?: { src: string; alt?: string };
  /** Leave unset until announced; the event then shows as "coming soon". */
  organization?: Organization;
  /** DJ / performer names. */
  lineup?: string[];
}

export interface ImpactStats {
  raised: string;
  organizations: string;
  events: string;
  guests: string;
}

export interface ContactInfo {
  instagramHandle: string;
  instagramUrl: string;
}

export interface FormConfig {
  /** Worker URL that verifies Turnstile and emails the message. The recipient lives server-side. */
  endpoint: string;
  /** Public Turnstile site key (safe to ship in the page). */
  turnstileSiteKey: string;
}

export interface Venue {
  name: string;
  url: string;
  addressLines: string[];
}

export interface ThirstyThursdaysContent {
  /** The Our Impact section stays hidden until there is real history to show. */
  showImpact: boolean;
  venue: Venue;
  events: TTEvent[];
  organizations: Organization[];
  artists: Artist[];
  impact: ImpactStats;
  contact: ContactInfo;
  form: FormConfig;
  copyrightYear: string;
}

export const defaultContent: ThirstyThursdaysContent = {
  showImpact: false,

  venue: {
    name: 'The Brass Rail',
    url: 'https://thebrassrailsd.com/',
    addressLines: ['3796 Fifth Avenue', 'San Diego, CA 92103'],
  },

  events: [
    {
      id: '2027-01-21',
      date: '2027-01-21',
      time: '21:00',
      // ticketUrl: 'https://posh.vip/e/...',
      flyer: { src: flyerPlaceholder }, // placeholder; swap for the real flyer image
      organization: {
        name: '[Organization Name]',
        description:
          '[1–2 sentence description of the featured organization and the work it does.]',
        url: '#',
      },
      lineup: ['[DJ / Performer Names]'],
    },
    { id: '2027-02-18', date: '2027-02-18', time: '21:00' },
    { id: '2027-03-18', date: '2027-03-18', time: '21:00' },
  ],

  organizations: [
    {
      name: '[Organization Name]',
      description: '[Short 1–2 sentence description.]',
      url: '#',
    },
    {
      name: '[Organization Name]',
      description: '[Short 1–2 sentence description.]',
      url: '#',
    },
    {
      name: '[Organization Name]',
      description: '[Short 1–2 sentence description.]',
      url: '#',
    },
  ],

  artists: [
    {
      name: '5 a.m. Club',
      image: fiveAmClub,
      bio: 'Local San Diego house DJ who’s played at Nova, Bloom, Spin, and Avenue PB.',
      links: [{ label: 'Instagram', url: 'https://www.instagram.com/5amclub_music/' }],
    },
    {
      name: '[DJ / Performer Name]',
      bio: '[Optional one-line bio or style description.]',
      links: [{ label: 'SoundCloud', url: '#' }],
    },
    {
      name: '[DJ / Performer Name]',
      bio: '[Optional one-line bio or style description.]',
      links: [{ label: 'Website', url: '#' }],
    },
  ],

  impact: {
    raised: '$[Amount]',
    organizations: '[Number]',
    events: '[Number]',
    guests: '[Number]',
  },

  form: {
    endpoint: 'https://thirsty-thursdays-contact.thirstythursdays.workers.dev',
    turnstileSiteKey: '0x4AAAAAAFP3mj0HAA6s7nv6',
  },

  contact: {
    instagramHandle: '@thirstythursdays.sd',
    instagramUrl: 'https://www.instagram.com/thirstythursdays.sd/',
  },

  copyrightYear: '2027',
};
