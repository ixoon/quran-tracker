export type ArabicLetter = {
  id: string;
  order: number;
  isolated: string;
  name: string;
  transliteration: string;
  audioSlug: string;
  makhraj: string;
  example?: string;
};

export type ReadingCategory = 'syllable' | 'word';

export type ReadingItem = {
  id: string;
  arabic: string;
  transliteration: string;
  hint?: string;
  category: ReadingCategory;
};

export type QuizMode = 'listen' | 'recognize' | 'reading';

export type LetterQuizQuestion = {
  mode: Exclude<QuizMode, 'reading'>;
  correct: ArabicLetter;
  options: ArabicLetter[];
};

export type ReadingQuizQuestion = {
  correct: ReadingItem;
  options: ReadingItem[];
};
