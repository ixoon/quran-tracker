import { ARABIC_LETTERS } from '@/lib/huruf/letters';
import type { ArabicLetter, LetterQuizQuestion, QuizMode } from '@/lib/huruf/types';

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDistractors(correct: ArabicLetter, count: number): ArabicLetter[] {
  const pool = ARABIC_LETTERS.filter((letter) => letter.id !== correct.id);
  return shuffle(pool).slice(0, count);
}

export function createQuizQuestion(mode: Exclude<QuizMode, 'reading'>): LetterQuizQuestion {
  const correct = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
  const distractors = pickDistractors(correct, 3);
  const options = shuffle([correct, ...distractors]);

  return { mode, correct, options };
}

export function createQuizRound(length: number, mode: Exclude<QuizMode, 'reading'>): LetterQuizQuestion[] {
  return Array.from({ length }, () => createQuizQuestion(mode));
}

export const QUIZ_ROUND_LENGTH = 10;
