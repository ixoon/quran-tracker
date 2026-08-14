import { READING_ITEMS } from '@/lib/huruf/reading';
import type { ReadingItem, ReadingQuizQuestion } from '@/lib/huruf/types';

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickReadingDistractors(correct: ReadingItem, count: number): ReadingItem[] {
  const pool = READING_ITEMS.filter((item) => item.id !== correct.id);
  return shuffle(pool).slice(0, count);
}

export function createReadingQuestion(): ReadingQuizQuestion {
  const correct = READING_ITEMS[Math.floor(Math.random() * READING_ITEMS.length)];
  const distractors = pickReadingDistractors(correct, 3);
  const options = shuffle([correct, ...distractors]);

  return { correct, options };
}

export function createReadingRound(length: number): ReadingQuizQuestion[] {
  return Array.from({ length }, () => createReadingQuestion());
}

export const READING_ROUND_LENGTH = 10;
