'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  PinkAceData,
  ChartType,
  Position,
  RfiDepth,
  JamDepth,
  TrainerStats,
  Card,
} from '@/lib/types';
import { dealHand, handToNotation, isHandInRange } from '@/lib/poker';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import PokerTable from './PokerTable';
import RangeGrid from './RangeGrid';

interface PreflopTrainerProps {
  data: PinkAceData;
}

interface HandState {
  cards: [Card, Card];
  notation: string;
  position: Position;
}

export default function PreflopTrainer({ data }: PreflopTrainerProps) {
  const [chartType, setChartType] = useState<ChartType>('rfi');
  const [rfiDepth, setRfiDepth] = useState<RfiDepth>('25BB');
  const [jamDepth, setJamDepth] = useState<JamDepth>('12BB');
  const [positionFilter, setPositionFilter] = useState<Position | 'all'>('all');
  const [stats, setStats] = useLocalStorage<TrainerStats>('pinkace-trainer-stats', {
    correct: 0,
    total: 0,
    streak: 0,
    bestStreak: 0,
  });

  const [hand, setHand] = useState<HandState | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showRange, setShowRange] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{ inRange: boolean; action: string } | null>(null);

  const currentDepth = chartType === 'rfi' ? rfiDepth : jamDepth;
  const depths = chartType === 'rfi' ? data.rfiDepths : data.jamDepths;
  const actionLabel = chartType === 'rfi' ? 'Raise' : 'Jam';

  const getRandomPosition = useCallback((): Position => {
    if (positionFilter !== 'all') return positionFilter;
    const positions = data.positions;
    return positions[Math.floor(Math.random() * positions.length)];
  }, [positionFilter, data.positions]);

  const dealNewHand = useCallback(() => {
    const cards = dealHand();
    const notation = handToNotation(cards[0], cards[1]);
    const position = getRandomPosition();
    setHand({ cards, notation, position });
    setResult(null);
    setShowRange(false);
    setLastAnswer(null);
  }, [getRandomPosition]);

  useEffect(() => {
    dealNewHand();
  }, [chartType, rfiDepth, jamDepth, positionFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCurrentRange = (): string[] => {
    if (!hand) return [];
    const ranges = chartType === 'rfi' ? data.rfi : data.openJam;
    const depthRanges = ranges[currentDepth as keyof typeof ranges];
    if (!depthRanges) return [];
    return (depthRanges as Record<Position, string[]>)[hand.position] || [];
  };

  const handleAction = (userAction: 'raise' | 'fold') => {
    if (!hand || result) return;
    const range = getCurrentRange();
    const inRange = isHandInRange(hand.notation, range);
    const isCorrect =
      (userAction === 'raise' && inRange) || (userAction === 'fold' && !inRange);

    setResult(isCorrect ? 'correct' : 'wrong');
    setShowRange(true);
    setLastAnswer({ inRange, action: userAction === 'raise' ? actionLabel : 'Fold' });

    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
      bestStreak: isCorrect
        ? Math.max(prev.bestStreak, prev.streak + 1)
        : prev.bestStreak,
    }));
  };

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Chart type toggle */}
        <div className="flex rounded-lg overflow-hidden border border-[#2a2a3a]">
          <button
            onClick={() => setChartType('rfi')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              chartType === 'rfi'
                ? 'bg-pink-500 text-white'
                : 'bg-[#16161f] text-gray-400 hover:text-white'
            }`}
          >
            RFI
          </button>
          <button
            onClick={() => setChartType('openJam')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              chartType === 'openJam'
                ? 'bg-pink-500 text-white'
                : 'bg-[#16161f] text-gray-400 hover:text-white'
            }`}
          >
            Open Jam
          </button>
        </div>

        {/* Stack depth */}
        <select
          value={currentDepth}
          onChange={(e) => {
            if (chartType === 'rfi') setRfiDepth(e.target.value as RfiDepth);
            else setJamDepth(e.target.value as JamDepth);
          }}
          className="bg-[#16161f] border border-[#2a2a3a] text-white rounded-lg px-3 py-2 text-sm"
        >
          {depths.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Position filter */}
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value as Position | 'all')}
          className="bg-[#16161f] border border-[#2a2a3a] text-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Positions</option>
          {data.positions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${accuracy >= 70 ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-gray-400">Accuracy:</span>
          <span className="font-bold text-white">{accuracy}%</span>
        </div>
        <div>
          <span className="text-gray-400">Streak:</span>{' '}
          <span className="font-bold text-pink-500">{stats.streak}</span>
        </div>
        <div>
          <span className="text-gray-400">Best:</span>{' '}
          <span className="font-bold text-white">{stats.bestStreak}</span>
        </div>
        <div>
          <span className="text-gray-400">Hands:</span>{' '}
          <span className="font-bold text-white">{stats.total}</span>
        </div>
        {stats.total > 0 && (
          <button
            onClick={() => setStats({ correct: 0, total: 0, streak: 0, bestStreak: 0 })}
            className="text-gray-500 hover:text-gray-300 text-xs ml-auto"
          >
            Reset
          </button>
        )}
      </div>

      {/* Poker table */}
      {hand && (
        <PokerTable
          activePosition={hand.position}
          heroCards={hand.cards}
          compact
        />
      )}

      {/* Action info */}
      {hand && !result && (
        <div className="text-center">
          <p className="text-sm text-gray-400">
            You are in <span className="text-pink-500 font-bold">{hand.position}</span> with{' '}
            <span className="text-white font-bold">{hand.notation}</span> at{' '}
            <span className="text-white font-bold">{currentDepth}</span>
          </p>
        </div>
      )}

      {/* Action buttons */}
      {!result && hand && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handleAction('raise')}
            className="btn-primary text-lg px-8 py-3"
          >
            {actionLabel}
          </button>
          <button
            onClick={() => handleAction('fold')}
            className="btn-secondary text-lg px-8 py-3"
          >
            Fold
          </button>
        </div>
      )}

      {/* Result */}
      {result && hand && lastAnswer && (
        <div className={`text-center space-y-3 animate-fade-in ${result === 'correct' ? 'result-correct' : 'result-wrong'}`}>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-2xl font-bold ${result === 'correct' ? 'text-emerald-500' : 'text-red-500'}`}>
              {result === 'correct' ? 'Correct!' : 'Wrong!'}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            <span className="text-white font-bold">{hand.notation}</span> is{' '}
            <span className={lastAnswer.inRange ? 'text-emerald-500 font-bold' : 'text-red-400 font-bold'}>
              {lastAnswer.inRange ? `a ${actionLabel.toLowerCase()}` : 'a fold'}
            </span>
            {' '}from <span className="text-pink-500 font-bold">{hand.position}</span> at {currentDepth}
          </p>
          <button
            onClick={dealNewHand}
            className="btn-primary"
          >
            Next Hand
          </button>
        </div>
      )}

      {/* Range grid */}
      {showRange && hand && (
        <div className="animate-slide-up">
          <h3 className="text-sm font-medium text-gray-400 text-center mb-2">
            {chartType === 'rfi' ? 'RFI' : 'Open Jam'} Range — {hand.position} at {currentDepth}
          </h3>
          <RangeGrid range={getCurrentRange()} highlightHand={hand.notation} />
        </div>
      )}
    </div>
  );
}
