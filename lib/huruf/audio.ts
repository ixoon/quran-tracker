/** Free letter pronunciation audio — Alfathon (MIT): github.com/kholmatov/alfathon */
const AUDIO_BASE =
  'https://raw.githubusercontent.com/kholmatov/alfathon/main/app/src/main/res/raw';

export function getLetterAudioUrl(audioSlug: string): string {
  return `${AUDIO_BASE}/${audioSlug}.mp3`;
}
