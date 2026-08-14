import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ArabicText } from '@/components/ArabicText';
import {
  READING_ROUND_LENGTH,
  createReadingRound,
  type ReadingItem,
  type ReadingQuizQuestion,
} from '@/lib/huruf';
import { useStrings } from '@/lib/i18n';
import { useHurufStore } from '@/stores/hurufStore';

export function ReadingQuiz() {
  const strings = useStrings();
  const recordQuizRound = useHurufStore((s) => s.recordQuizRound);
  const bestQuizScore = useHurufStore((s) => s.bestQuizScore);

  const [questions, setQuestions] = useState<ReadingQuizQuestion[]>(() =>
    createReadingRound(READING_ROUND_LENGTH),
  );
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const answered = selectedId !== null;

  const startNewRound = useCallback(() => {
    setQuestions(createReadingRound(READING_ROUND_LENGTH));
    setIndex(0);
    setSelectedId(null);
    setCorrectCount(0);
    setFinished(false);
  }, []);

  const handleSelect = (item: ReadingItem) => {
    if (answered || !question) return;

    const isCorrect = item.id === question.correct.id;
    setSelectedId(item.id);

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
              {strings('letters.personalBest', { score: bestQuizScore, total: READING_ROUND_LENGTH })}
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
        <Text className="mb-3 text-center text-base font-medium text-ink-900 dark:text-ink-50">
          {strings('letters.howReadThis')}
        </Text>
        <ArabicText variant="letter">{question.correct.arabic}</ArabicText>
        {question.correct.hint ? (
          <Text className="mt-3 text-xs text-ink-700 dark:text-ink-200">{question.correct.hint}</Text>
        ) : null}
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
          }

          return (
            <Pressable
              key={option.id}
              className={optionClass}
              disabled={answered}
              onPress={() => handleSelect(option)}>
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
                  {option.transliteration}
                </Text>
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
