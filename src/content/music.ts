import type { StoryMedia } from '@/types/content';

export interface MusicResource {
  id: string;
  title: string;
  spotify?: string;
  yandex?: string;
}

export const musicResources: Record<string, MusicResource> = {
  blurryface: { id: 'blurryface', title: 'Blurryface', spotify: 'https://open.spotify.com/album/3cQO7jp5S9qLBoIVtbkSM1', yandex: 'https://music.yandex.ru/album/2747498' },
  trench: { id: 'trench', title: 'Trench', spotify: 'https://open.spotify.com/album/621cXqrTSSJi1WqDMSLmbL', yandex: 'https://music.yandex.ru/album/5838243' },
  scaled: { id: 'scaled', title: 'Scaled and Icy', spotify: 'https://open.spotify.com/album/0Q5XBpCYFgUWiG9DUWyAmJ', yandex: 'https://music.yandex.ru/album/15705954' },
  clancy: { id: 'clancy', title: 'Clancy', spotify: 'https://open.spotify.com/album/1KFWgQTw3EMTQebaaepVBI', yandex: 'https://music.yandex.ru/album/31355321' },
  breach: { id: 'breach', title: 'Breach', spotify: 'https://open.spotify.com/album/1El3k8dU3sKyoGUeuyrolH', yandex: 'https://music.yandex.ru/album/38174716' }
};

function video(id: string, title: string): StoryMedia {
  return { id, title, youtube: `https://www.youtube.com/watch?v=${id}`, image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
}

export const storyVideos = {
  heavydirtysoul: video('r_9Kf0D5BTs', 'Heavydirtysoul'),
  jumpsuit: video('UOUBW8bkjQ4', 'Jumpsuit'),
  nico: video('hMAPyGoqQVw', 'Nico and the Niners'),
  levitate: video('uv_1AKKKJnk', 'Levitate'),
  saturday: video('FiXVRdotCEk', 'Saturday'),
  outside: video('eNcvblM8-_o', 'The Outside'),
  iamclancy: video('ozlHHR_eSxc', 'I Am Clancy'),
  overcompensate: video('53tgVlXBZVg', 'Overcompensate'),
  navigating: video('07YtBj3BEBQ', 'Navigating'),
  paladin: video('mix9YfaaNa0', 'Paladin Strait'),
  contract: video('QZfH7cFp3Ys', 'The Contract'),
  citywalls: video('5Ozjel72yjQ', 'City Walls')
} as const;

export const playlistMedia: { media: StoryMedia; album?: string }[] = [
  { media: storyVideos.heavydirtysoul, album: 'blurryface' },
  { media: storyVideos.jumpsuit, album: 'trench' },
  { media: storyVideos.nico, album: 'trench' },
  { media: storyVideos.levitate, album: 'trench' },
  { media: storyVideos.saturday, album: 'scaled' },
  { media: storyVideos.outside, album: 'scaled' },
  { media: storyVideos.iamclancy },
  { media: storyVideos.overcompensate, album: 'clancy' },
  { media: storyVideos.navigating, album: 'clancy' },
  { media: storyVideos.paladin, album: 'clancy' },
  { media: storyVideos.contract, album: 'breach' },
  { media: storyVideos.citywalls, album: 'breach' }
];
