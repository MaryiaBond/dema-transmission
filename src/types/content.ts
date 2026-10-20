export type LanguageCode = 'ru' | 'be' | 'en' | 'es';
export type GlossaryId = 'blurryface' | 'dema' | 'bishops' | 'clancy' | 'banditos' | 'ned' | 'seizing' | 'torchbearer';
export type AllowedRichTag = 'a' | 'br' | 'button' | 'div' | 'em' | 'h2' | 'i' | 'p' | 'small' | 'span' | 'strong';

export type RichNode =
  | { type: 'text'; value: string }
  | { type: 'element'; tag: AllowedRichTag; attrs: Record<string, string>; children: RichNode[] };

export type RichContent = RichNode[];
export type LocalizedText = string | RichContent;

export interface UiLocale {
  skip: string;
  brandAria: string;
  brandTagline: string;
  here: string;
  modeAria: string;
  read: LocalizedText;
  explore: LocalizedText;
  menuOpen: string;
  menuClose: string;
  mobileNav: string;
  mobileArchive: string;
  language: string;
  languageMenu: string;
  close: string;
  railAria: string;
  railTitle: LocalizedText;
  railStatus: string;
  chapters: string[];
  mobileChapters: string[];
  youtubeWatch: string;
  preview: string;
  youtubeLabel: string;
  spotifyName: string;
  yandexName: string;
  spotifyLabel: string;
  yandexLabel: string;
  albumSpotify: string;
  albumYandex: string;
}

export interface HeroLocale {
  alt: string;
  photoCredit: string;
  meta: LocalizedText;
  title: LocalizedText;
  copy: string;
  enter: LocalizedText;
  prologue: LocalizedText;
  scroll: string;
}

export interface OriginLocale {
  meta: RichContent;
  heading: RichContent;
  prose: RichContent;
  tylerAlt: string;
  joshAlt: string;
  tylerRole: string;
  joshRole: string;
  quote: string;
  tail: RichContent;
}

export interface ChapterLocale {
  meta: RichContent;
  overline: string;
  title: RichContent;
  narrative: RichContent;
  tail: RichContent;
  featureHead?: RichContent;
  alt?: string;
  fallback?: LocalizedText;
  desc?: string;
  mapAria?: string;
  mapCoord?: string;
  mapLegend?: string;
  videos?: string[];
  list?: string;
  watch?: string;
  dossier?: Record<'top' | 'rec' | 'graphic' | 'end', LocalizedText>;
  spoilerHead?: RichContent;
  spoilerButton?: string;
  spoiler?: RichContent;
}

export interface GlossaryEntry { title: string; desc: string; source: string }

export interface LocalizedContent {
  code: string;
  name: string;
  locale: LanguageCode;
  title: string;
  description: string;
  ui: UiLocale;
  hero: HeroLocale;
  origin: OriginLocale;
  chapters: [null, ...ChapterLocale[]];
  cycle: {
    counter: string; counterAria: string; signal: string; title: RichContent; copy: RichContent;
    video: LocalizedText; videoAria: string; continues: string; beginning: string;
    terminalCode: string; terminalBefore: string; terminalTitle: string; terminalCount: string;
    terminalCopy: string; terminalSignoff: string;
  };
  watchlist: { pretitle: string; title: RichContent; copy: string; note: string; top: string };
  archive: {
    pretitle: string; title: RichContent; copy: string; button: string; dialogLabel: string;
    dialogTitle: RichContent; dialogCopy: string; future: string; items: string[]; back: string;
    alt: string; violation: RichContent; restricted: RichContent; denied: string;
  };
  footer: {
    about: string; media: string; youtube: string; spotify: string; sources: string;
    credits: RichContent; experience: string; unofficial: string;
  };
  glossaryUi: { label: string; end: string };
  glossary: Record<GlossaryId, GlossaryEntry>;
  playlist: [string, string, string][];
}

export interface StoryChapterDefinition {
  number: number;
  id: string;
  className: string;
  year: number;
  album?: string;
  narrativeBlockIds: string[];
  feature?: StoryMedia;
  videos?: StoryMedia[];
  musicAlbum?: string;
}

export interface StoryMedia {
  id: string;
  title: string;
  youtube: string;
  image: string;
}
