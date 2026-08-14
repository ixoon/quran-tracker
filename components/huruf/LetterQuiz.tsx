import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { ArabicText } from '@/components/ArabicText';
import { useLetterAudio } from '@/hooks/useLetterAudio';
import {
  ARABIC_LETTERS,
  QUIZ_ROUND_LENGTH,
  createQuizRound,
  type ArabicLetter,
  type LetterQuizQuestion,
  type QuizMode,
} from '@/lib/huruf';
import { useStrings } from '@/lib/i18n';
import { useHurufStore } from '@/stores/hurufStore';

type LetterQuizProps = {
  mode: Exclude<QuizMode, 'reading'>;
};

export function LetterQuiz({ mode }: LetterQuizProps) {
  const strings = useStrings();
  const recordQuizRound = useHurufStore((s) => s.recordQuizRound);
  const bestQuizScore = useHurufStore((s) => s.bestQuizScore);
  const { playingId, isLoading, playLetter } = useLetterAudio();

  const [questions, setQuestions] = useState<LetterQuizQuestion[]>(() =>
    createQuizRound(QUIZ_ROUND_LENGTH, mode),
  );
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const answered = selectedId !== null;

  const startNewRound = useCallback(() => {
    setQuestions(createQuizRound(QUIZ_ROUND_LENGTH, mode));
    setIndex(0);
    setSelectedId(null);
    setCorrectCount(0);
    setFinished(false);
  }, [mode]);

  useEffect(() => {
    startNewRound();
  }, [mode, startNewRound]);

  useEffect(() => {
    if (mode !== 'listen' || !question || finished) return;
    void playLetter(question.correct.id, question.correct.audioSlug);
  }, [finished, mode, playLetter, question]);

  const handleSelect = (letter: ArabicLetter) => {
    if (answered || !question) return;

    const isCorrect = letter.id === question.correct.id;
    setSelectedId(letter.id);

    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    if (isCorrect) {
      setCorrectCount(nextCorrect);
    }

    if (index + 1 >= questions.length) {
      setFinished(true);
      recordQuizRound(nextCorrect, questions.length);
    }
  };

  const handleNext = () => {
    if (!answered) return;
    setIndex((current) => current + 1);
    setSelectedId(null);
  };

  const progressLabel = useMemo(() => {
    if (finished) {
      return strings('letters.roundComplete', {
        correct: correctCount,
        total: questions.length,
      });
    }
    return strings('letters.questionOf', { current: index + 1, total: questions.length });
  }, [correctCount, finished, index, questions.length, strings]);

  if (!question) return null;

  if (finished) {
    const percent = Math.round((correctCount / questions.length) * 100);
    return (
      <View className="rounded-2xl bg-white p-6 dark:bg-ink-800">
        <View className="items-center">
          <FontAwesome
            name={percent >= 80 ? 'trophy' : percent >= 50 ? 'star' : 'refresh'}
            size={36}
            color="#16a34a"
          />
          <Text className="mt-4 text-2xl font-bold text-ink-900 dark:text-ink-50">
            {correctCount}/{questions.length}
          </Text>
          <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">{progressLabel}</Text>
          {bestQuizScore > 0 ? (
            <Text className="mt-2 text-xs text-ink-700 dark:text-ink-200">
              {strings('letters.personalBest', { score: bestQuizScore, total: QUIZ_ROUND_LENGTH })}
            </Text>
          ) : null}
        </View>

        <Pressable
          className="mt-6 items-center rounded-xl bg-brand-600 py-4"
          onPress={startNewRound}>
          <Text className="font-semibold text-white">{strings('common.tryAgain')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="rounded-2xl bg-white p-5 dark:bg-ink-800">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-ink-700 dark:text-ink-200">{progressLabel}</Text>
        <Text className="text-sm font-semibold text-brand-700 dark:text-brand-400">
          {strings('letters.score', { score: correctCount })}
        </Text>
      </View>

      <View className="mb-5 items-center rounded-2xl bg-ink-100 px-4 py-8 dark:bg-ink-700">
        {mode === 'listen' ? (
          <>
            <Text className="mb-4 text-center text-base font-medium text-ink-900 dark:text-ink-50">
              {strings('letters.whichLetter')}
            </Text>
            <Pressable
              className="h-16 w-16 items-center justify-center rounded-full bg-brand-600"
              onPress={() => void playLetter(question.correct.id, question.correct.audioSlug)}>
              {isLoading && playingId === question.correct.id ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <FontAwesome name="volume-up" size={24} color="#ffffff" />
              )}
            </Pressable>
            <Text className="mt-3 text-xs text-ink-700 dark:text-ink-200">
              {strings('letters.tapReplay')}
            </Text>
          </>
        ) : (
          <>
            <Text className="mb-3 text-center text-base font-medium text-ink-900 dark:text-ink-50">
              {strings('letters.whatLetterCalled')}
            </Text>
            <ArabicText variant="letter">{question.correct.isolated}</ArabicText>
          </>
        )}
      </View>

      <View className="gap-2">
        {question.options.map((option) => {
          const isSelected = selectedId === option.id;
          const isCorrect = option.id === question.correct.id;
          let optionClass =
            'rounded-xl border px-4 py-3.5 active:opacity-80 border-ink-200 bg-ink-50 dark:border-ink-600 dark:bg-ink-700';

          if (answered) {
            if (isCorrect) {
              optionClass =
                'rounded-xl border px-4 py-3.5 border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/40';
            } else if (isSelected) {
              optionClass =
                'rounded-xl border px-4 py-3.5 border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/30';
            }
          } else if (isSelected) {
            optionClass =
              'rounded-xl border px-4 py-3.5 border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/40';
          }

          return (
            <Pressable
              key={option.id}
              className={optionClass}
              disabled={answered}
              onPress={() => handleSelect(option)}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <ArabicText variant="surahList">{option.isolated}</ArabicText>
                  <Text className="text-base font-medium text-ink-900 dark:text-ink-50">
                    {option.name}
                  </Text>
                </View>
                {answered && isCorrect ? (
                  <FontAwesome name="check" size={14} color="#16a34a" />
                ) : null}
                {answered && isSelected && !isCorrect ? (
                  <FontAwesome name="times" size={14} color="#ef4444" />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {answered && index + 1 < questions.length ? (
        <Pressable
          className="mt-4 items-center rounded-xl bg-brand-600 py-3.5"
          onPress={handleNext}>
          <Text className="font-semibold text-white">{strings('letters.nextQuestion')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function HurufProgressSummary() {
  const strings = useStrings();
  const studiedLetterIds = useHurufStore((s) => s.studiedLetterIds);
  const studiedCount = studiedLetterIds.length;
  const total = ARABIC_LETTERS.length;
  const percent = Math.round((studiedCount / total) * 100);

  return (
    <View className="rounded-2xl bg-white px-4 py-4 dark:bg-ink-800">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-ink-700 dark:text-ink-200">
          {strings('letters.lettersLearned')}
        </Text>
        <Text className="text-sm font-bold text-brand-700 dark:text-brand-400">
          {studiedCount}/{total}
        </Text>
      </View>
      <View className="mt-2 h-2 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-700">
        <View className="h-full rounded-full bg-brand-600" style={{ width: `${percent}%` }} />
      </View>
    </View>
  );
}
