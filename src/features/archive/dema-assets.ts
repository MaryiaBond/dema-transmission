import type { CaseId } from '@/types/archive';

export type DemaAssetFit = 'cover' | 'contain';
export type DemaAssetOverlay = 'none' | 'soft' | 'strong' | 'hero';

export interface DemaVisualAsset {
  fileName: string;
  src: string;
  purpose: string;
  width: number;
  height: number;
  aspectRatio: string;
  fit: DemaAssetFit;
  position: string;
  mobilePosition: string;
  overlay: DemaAssetOverlay;
}

const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const publicDemaAsset = (fileName: string): string => `${baseUrl}assets/dema/${fileName}`;

function asset(
  fileName: string,
  purpose: string,
  width: number,
  height: number,
  options: Partial<Pick<DemaVisualAsset, 'fit' | 'position' | 'mobilePosition' | 'overlay'>> = {}
): DemaVisualAsset {
  return {
    fileName,
    src: publicDemaAsset(fileName),
    purpose,
    width,
    height,
    aspectRatio: `${width} / ${height}`,
    fit: options.fit ?? 'cover',
    position: options.position ?? 'center',
    mobilePosition: options.mobilePosition ?? options.position ?? 'center',
    overlay: options.overlay ?? 'soft'
  };
}

export const demaAssets = {
  archiveHero: asset('hero-archive-employee.png', 'THE ARCHIVE onboarding hero', 941, 1672, {
    position: 'center 58%', mobilePosition: 'center 47%', overlay: 'hero'
  }),
  caseMissingMembers: asset('case-missing-members.png', 'CASE 001 cover', 1672, 941, {
    position: 'center 48%', mobilePosition: '43% center', overlay: 'strong'
  }),
  caseInvisibleColor: asset('case-invisible-color.png', 'CASE 002 cover', 1672, 941, {
    position: 'center 52%', mobilePosition: '48% center', overlay: 'strong'
  }),
  casePerfectBroadcast: asset('case-perfect-broadcast.png', 'CASE 003 cover', 1672, 941, {
    position: 'center 48%', mobilePosition: 'center', overlay: 'strong'
  }),
  demaCity: asset('mood-dema-city.png', 'DEMA city panorama', 1672, 941, {
    position: 'center 48%', mobilePosition: '58% center'
  }),
  cathedral: asset('mood-cathedral.png', 'Sacred architecture and authority', 1122, 1402, {
    position: 'center 55%', mobilePosition: 'center 45%'
  }),
  stainedGlass: asset('mood-stained-glass.png', 'Cult and bishop visual transition', 1122, 1402, {
    position: 'center 42%', mobilePosition: 'center 36%'
  }),
  sovietBlocks: asset('mood-soviet-blocks.png', 'Everyday life in DEMA', 1122, 1402, {
    position: 'center 52%', mobilePosition: 'center 55%'
  }),
  demaPropaganda: asset('mood-dema-propaganda.png', 'Control and propaganda system', 1536, 1024, {
    position: 'center 46%', mobilePosition: '42% center'
  }),
  mcDema: asset('mood-mcdema.png', 'Everyday absurdity inside DEMA', 1122, 1402, {
    position: 'center 57%', mobilePosition: 'center 58%'
  }),
  archiveRoom: asset('mood-archive-room.png', 'Archive documents and workplace', 1536, 1024, {
    position: 'center 55%', mobilePosition: '56% center'
  }),
  wetStreets: asset('mood-wet-streets.png', 'DEMA street transition', 1536, 1024, {
    position: 'center 52%', mobilePosition: '58% center'
  }),
  twoKidsRooftop: asset('mood-two-kids-rooftop.png', 'Human moment above DEMA', 1536, 1024, {
    position: 'center 58%', mobilePosition: '43% center'
  }),
  employeeBadge: asset('badge-employee-021.png', 'Employee 021 credential', 1536, 1024, {
    fit: 'contain', position: 'center', mobilePosition: 'center', overlay: 'none'
  }),
  level01Complete: asset('level01-complete.png', 'LEVEL 01 completion record', 1536, 1024, {
    fit: 'contain', position: 'center', mobilePosition: 'center', overlay: 'none'
  })
} as const satisfies Record<string, DemaVisualAsset>;

export const caseCoverAssets: Record<CaseId, DemaVisualAsset> = {
  case_001: demaAssets.caseMissingMembers,
  case_002: demaAssets.caseInvisibleColor,
  case_003: demaAssets.casePerfectBroadcast
};

export const caseAtmosphereAssets: Record<'documents' | 'board' | 'music', Record<CaseId, DemaVisualAsset>> = {
  documents: {
    case_001: demaAssets.archiveRoom,
    case_002: demaAssets.sovietBlocks,
    case_003: demaAssets.demaPropaganda
  },
  board: {
    case_001: demaAssets.demaCity,
    case_002: demaAssets.stainedGlass,
    case_003: demaAssets.cathedral
  },
  music: {
    case_001: demaAssets.wetStreets,
    case_002: demaAssets.mcDema,
    case_003: demaAssets.twoKidsRooftop
  }
};
