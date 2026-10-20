import { storyVideos } from './music';
import type { StoryChapterDefinition } from '@/types/content';

const narrativeIds = (chapter: number, count = 5) => Array.from({ length: count }, (_, index) => `chapter.${chapter}.narrative.${index}`);

export const chapters: StoryChapterDefinition[] = [
  { number: 0, id: 'origin', className: 'chapter-origin', year: 2009, narrativeBlockIds: ['origin.prose.0', 'origin.prose.1', 'origin.prose.2', 'origin.prose.3', 'origin.prose.4'] },
  { number: 1, id: 'blurryface', className: 'chapter-blurry', year: 2015, album: 'Blurryface', narrativeBlockIds: narrativeIds(1, 4), feature: storyVideos.heavydirtysoul, musicAlbum: 'blurryface' },
  { number: 2, id: 'trench', className: 'chapter-trench', year: 2018, album: 'Trench', narrativeBlockIds: narrativeIds(2), videos: [storyVideos.jumpsuit, storyVideos.nico, storyVideos.levitate], musicAlbum: 'trench' },
  { number: 3, id: 'scaled', className: 'chapter-scaled', year: 2021, album: 'Scaled and Icy', narrativeBlockIds: narrativeIds(3), feature: storyVideos.saturday, musicAlbum: 'scaled' },
  { number: 4, id: 'outside', className: 'chapter-outside', year: 2022, album: 'Scaled and Icy', narrativeBlockIds: narrativeIds(4), feature: storyVideos.outside },
  { number: 5, id: 'clancy', className: 'chapter-clancy', year: 2024, album: 'Clancy', narrativeBlockIds: narrativeIds(5), feature: storyVideos.overcompensate, videos: [storyVideos.navigating, storyVideos.paladin], musicAlbum: 'clancy' },
  { number: 6, id: 'breach', className: 'chapter-breach', year: 2025, album: 'Breach', narrativeBlockIds: narrativeIds(6), feature: storyVideos.citywalls, musicAlbum: 'breach' }
];

export const storyBlockIds = chapters.flatMap((chapter) => [
  `${chapter.id}.meta`, `${chapter.id}.title`, ...chapter.narrativeBlockIds, `${chapter.id}.tail`
]);
