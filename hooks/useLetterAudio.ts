import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getLetterAudioUrl } from '@/lib/huruf/audio';

export function useLetterAudio() {
  const playerRef = useRef<AudioPlayer | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const player = createAudioPlayer(null, { updateInterval: 200 });
    playerRef.current = player;

    const onStatus = (status: AudioStatus) => {
      if (!mounted) return;

      if (status.isLoaded) {
        setIsLoading(status.isBuffering);
      }

      if (status.didJustFinish) {
        setPlayingId(null);
        setIsLoading(false);
      }
    };

    const subscription = player.addListener('playbackStatusUpdate', onStatus);

    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'duckOthers',
    });

    return () => {
      mounted = false;
      subscription.remove();
      player.remove();
      playerRef.current = null;
    };
  }, []);

  const playLetter = useCallback(async (letterId: string, audioSlug: string) => {
    const player = playerRef.current;
    if (!player) return;

    try {
      player.pause();
    } catch {
      // ignore pause errors when switching clips
    }

    setPlayingId(letterId);
    setIsLoading(true);
    player.replace(getLetterAudioUrl(audioSlug));
    player.play();
  }, []);

  const stop = useCallback(() => {
    playerRef.current?.pause();
    playerRef.current?.seekTo(0);
    setPlayingId(null);
    setIsLoading(false);
  }, []);

  return {
    playingId,
    isLoading,
    playLetter,
    stop,
  };
}
