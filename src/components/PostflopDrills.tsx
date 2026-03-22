'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { PinkAceData, PostflopScenario } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import PokerTable from './PokerTable';

interface PostflopDrillsProps {
  data: PinkAceData;
}

interface DrillStats {
  correct: number;
  total: number;
}

export default function PostflopDrills({ data }: PostflopDrillsProps) {
  const scenarios = data.postflopScenarios;
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(scenarios.map((s) => s.category)))],
    [scenarios]
  );

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stats, setStats] = useLocalStorage<DrillStats>('pinkace-postflop-stats', {
    correct: 0,
    total: 0,
  });

  const filteredScenarios = useMemo(
    () =>
      categoryFilter === 'All'
        ? scenarios
        : scenarios.filter((s) => s.category === categoryFilter),
    [scenarios, categoryFilter]
  );

  const [seenIndices, setSeenIndices] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const getNextIndex = useCallback((): number => {
    const available = filteredScenarios
      .map((_, i) => i)
      .filter((i) => !seenIndices.has(i));

    if (available.length === 0) {
      setSeenIndices(new Set());
      return Math.floor(Math.random() * filteredScenarios.length);
    }

    return available[Math.floor(Math.random() * available.length)];
  }, [filteredScenarios, seenIndices]);

  useEffect(() => {
    setSeenIndices(new Set());
    setSelectedOption(null);
    setShowResult(false);
    setCurrentIndex(0);
  }, [categoryFilter]);

  const scenario: PostflopScenario | undefined = filteredScenarios[currentIndex];

  const handleAnswer = (optionIndex: number) => {
    if (showResult) return;
    setSelectedOption(optionIndex);
    setShowResult(true);
    setSeenIndices((prev) => new Set(prev).add(currentIndex));

    const isCorrect = optionIndex === scenario.correctIndex;
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowResult(false);
    setCurrentIndex(getNextIndex());
  };

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  if (!scenario) {
    return <div className="text-center text-gray-400 py-8">No scenarios available for this category.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              categoryFilter === cat
                ? 'bg-pink-500 text-white'
                : 'bg-[#16161f] text-gray-400 hover:text-white border border-[#2a2a3a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${accuracy >= 70 ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-gray-400">Accuracy:</span>
          <span className="font-bold text-white">{accuracy}%</span>
        </div>
        <div>
          <span className="text-gray-400">Drills:</span>{' '}
          <span className="font-bold text-white">{stats.total}</span>
        </div>
        <div>
          <span className="text-gray-400">Progress:</span>{' '}
          <span className="font-bold text-white">{seenIndices.size}/{filteredScenarios.length}</span>
        </div>
        {stats.total > 0 && (
          <button
            onClick={() => setStats({ correct: 0, total: 0 })}
            className="text-gray-500 hover:text-gray-300 text-xs ml-auto"
          >
            Reset
          </button>
        )}
      </div>

      {/* Scenario info */}
      <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-pink-500 bg-pink-500/10 px-2 py-1 rounded">
            {scenario.category}
          </span>
          <span className="text-xs text-gray-500">Pot: {scenario.pot}</span>
        </div>
        <h3 className="text-lg font-bold text-white">{scenario.title}</h3>
        <p className="text-sm text-gray-300">{scenario.situation}</p>
      </div>

      {/* Table with board and hero cards */}
      <PokerTable
        communityCards={scenario.board}
        heroCards={scenario.hero}
        activePosition="BU"
        compact
      />

      {/* Answer options */}
      <div className="grid grid-cols-2 gap-3">
        {scenario.options.map((option, i) => {
          let optionStyle = 'bg-[#16161f] border-[#2a2a3a] text-white hover:border-pink-500/50';

          if (showResult) {
            if (i === scenario.correctIndex) {
              optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-400';
            } else if (i === selectedOption && i !== scenario.correctIndex) {
              optionStyle = 'bg-red-500/20 border-red-500 text-red-400';
            } else {
              optionStyle = 'bg-[#16161f] border-[#2a2a3a] text-gray-500';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={showResult}
              className={`p-3 rounded-lg border-2 font-medium text-sm transition-all ${optionStyle} ${
                !showResult ? 'cursor-pointer active:scale-[0.97]' : 'cursor-default'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className="animate-slide-up space-y-3">
          <div className={`p-4 rounded-lg border ${
            selectedOption === scenario.correctIndex
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <p className="text-sm font-bold mb-1">
              {selectedOption === scenario.correctIndex ? 'Correct!' : 'Incorrect!'}
              {' '}The GTO play is: <span className="text-pink-500">{scenario.options[scenario.correctIndex]}</span>
            </p>
            <p className="text-sm text-gray-300">{scenario.explanation}</p>
          </div>
          <div className="text-center">
            <button onClick={handleNext} className="btn-primary">
              Next Scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
