import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

type UseVerseAudioOptions = {
  audioMap: Map<number, string>;
  onAyahChange?: (ayahNumberInSurah: number) => void;
};

export function useVerseAudio({ audioMap, onAyahChange }: UseVerseAudioOptions) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const queueRef = useRef<number[]>([]);
  const playingRef = useRef(false);
  const onAyahChangeRef = useRef(onAyahChange);
  const currentAyahRef = useRef<number | null>(null);

  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    onAyahChangeRef.current = onAyahChange;
  }, [onAyahChange]);

  const playAyahAtRef = useRef<(ayahNumber: number) => Promise<void>>(async () => {});

  playAyahAtRef.current = async (ayahNumber: number) => {
    const url = audioMap.get(ayahNumber);
    const player = playerRef.current;
    if (!url || !player) return;

    setIsLoading(true);
    currentAyahRef.current = ayahNumber;
    setActiveAyah(ayahNumber);
    onAyahChangeRef.current?.(ayahNumber);

    player.replace(url);
    player.play();
  };

  useEffect(() => {
    let mounted = true;
    const player = createAudioPlayer(null, { updateInterval: 250 });
    playerRef.current = player;

    const onStatus = (status: AudioStatus) => {
      if (!mounted) return;

      setIsPlaying(status.playing);
      if (status.isLoaded) {
        setIsLoading(status.isBuffering);
      }

      if (status.didJustFinish && playingRef.current && currentAyahRef.current !== null) {
        const currentIndex = queueRef.current.indexOf(currentAyahRef.current);
        const nextAyah = queueRef.current[currentIndex + 1];

        if (nextAyah !== undefined) {
          void playAyahAtRef.current(nextAyah);
        } else {
          playingRef.current = false;
          setIsPlaying(false);
          setActiveAyah(null);
          currentAyahRef.current = null;
          setIsLoading(false);
        }
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
      playingRef.current = false;
      subscription.remove();
      player.remove();
      playerRef.current = null;
    };
  }, []);

  const playFromAyah = useCallback(async (startAyah: number, allAyahNumbers: number[]) => {
    const startIndex = allAyahNumbers.indexOf(startAyah);
    if (startIndex === -1) return;

    queueRef.current = allAyahNumbers.slice(startIndex);
    playingRef.current = true;
    await playAyahAtRef.current(startAyah);
  }, []);

  const pause = useCallback(async () => {
    playingRef.current = false;
    playerRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(async () => {
    if (playerRef.current && currentAyahRef.current !== null) {
      playingRef.current = true;
      playerRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const stop = useCallback(async () => {
    playingRef.current = false;
    queueRef.current = [];
    currentAyahRef.current = null;
    setActiveAyah(null);
    setIsPlaying(false);
    setIsLoading(false);
    playerRef.current?.pause();
    playerRef.current?.seekTo(0);
  }, []);

  const togglePlayPause = useCallback(
    async (startAyah: number, allAyahNumbers: number[]) => {
      if (isPlaying) {
        await pause();
        return;
      }

      if (currentAyahRef.current !== null && playerRef.current) {
        await resume();
        return;
      }

      await playFromAyah(startAyah, allAyahNumbers);
    },
    [isPlaying, pause, playFromAyah, resume],
  );

  return {
    activeAyah,
    isPlaying,
    isLoading,
    playFromAyah,
    pause,
    resume,
    stop,
    togglePlayPause,
  };
}
