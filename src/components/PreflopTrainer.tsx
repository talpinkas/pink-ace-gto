'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  PinkAceData,
  ChartType,
  RfiPosition,
  JamPosition,
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
  rfiPosition?: RfiPosition;
  jamPosition?: JamPosition;
}

type UserAction = 'raise' | 'fold' | 'limp';

export default function PreflopTrainer({ data }: PreflopTrainerProps) {
  const [chartType, setChartType] = useState<ChartType>('rfi');
  const [jamDepth, setJamDepth] = useState<JamDepth>('12BB');
  const [rfiPosFilter, setRfiPosFilter] = useState<RfiPosition | 'all'>('all');
  const [jamPosFilter, setJamPosFilter] = useState<JamPosition | 'all'>('all');
  const [stats, setStats] = useLocalStorage<TrainerStats>('pinkace-trainer-stats', {
    correct: 0,
    total: 0,
    streak: 0,
    bestStreak: 0,
  });

  const [hand, setHand] = useState<HandState | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showRange, setShowRange] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{ correctAction: string; userAction: string } | null>(null);

  const isSB = chartType === 'rfi' && hand?.rfiPosition === 'SB';

  const getRandomRfiPosition = useCallback((): RfiPosition => {
    if (rfiPosFilter !== 'all') return rfiPosFilter;
    const positions = data.rfiPositions;
    return positions[Math.floor(Math.random() * positions.length)];
  }, [rfiPosFilter, data.rfiPositions]);

  const getRandomJamPosition = useCallback((): JamPosition => {
    if (jamPosFilter !== 'all') return jamPosFilter;
    const positions = data.positions;
    return positions[Math.floor(Math.random() * positions.length)];
  }, [jamPosFilter, data.positions]);

  const dealNewHand = useCallback(() => {
    const cards = dealHand();
    const notation = handToNotation(cards[0], cards[1]);
    if (chartType === 'rfi') {
      setHand({ cards, notation, rfiPosition: getRandomRfiPosition() });
    } else {
      setHand({ cards, notation, jamPosition: getRandomJamPosition() });
    }
    setResult(null);
    setShowRange(false);
    setLastAnswer(null);
  }, [chartType, getRandomRfiPosition, getRandomJamPosition]);

  useEffect(() => {
    dealNewHand();
  }, [chartType, jamDepth, rfiPosFilter, jamPosFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCurrentRange = (): string[] => {
    if (!hand) return [];
    if (chartType === 'rfi' && hand.rfiPosition) {
      return data.rfi[hand.rfiPosition] || [];
    }
    if (chartType === 'openJam' && hand.jamPosition) {
      const depthRanges = data.openJam[jamDepth];
      if (!depthRanges) return [];
      return depthRanges[hand.jamPosition] || [];
    }
    return [];
  };

  const getSbLimpRange = (): string[] => {
    return data.sbDetail?.limp || [];
  };

  const handleAction = (userAction: UserAction) => {
    if (!hand || result) return;

    let isCorrect = false;
    let correctAction = '';

    if (chartType === 'rfi' && hand.rfiPosition === 'SB') {
      // SB has 3 options: raise, limp, fold
      const raiseRange = data.rfi['SB'] || [];
      const limpRange = getSbLimpRange();
      const inRaise = isHandInRange(hand.notation, raiseRange);
      const inLimp = isHandInRange(hand.notation, limpRange);

      if (inRaise) {
        correctAction = 'Raise';
        isCorrect = userAction === 'raise';
      } else if (inLimp) {
        correctAction = 'Limp';
        isCorrect = userAction === 'limp';
      } else {
        correctAction = 'Fold';
        isCorrect = userAction === 'fold';
      }
    } else {
      // Standard 2-option: raise/jam or fold
      const range = getCurrentRange();
      const inRange = isHandInRange(hand.notation, range);
      const actionLabel = chartType === 'rfi' ? 'Raise' : 'Jam';

      if (inRange) {
        correctAction = actionLabel;
        isCorrect = userAction === 'raise';
      } else {
        correctAction = 'Fold';
        isCorrect = userAction === 'fold';
      }
    }

    setResult(isCorrect ? 'correct' : 'wrong');
    setShowRange(true);
    setLastAnswer({
      correctAction,
      userAction: userAction === 'raise' ? (chartType === 'rfi' ? 'Raise' : 'Jam') : userAction === 'limp' ? 'Limp' : 'Fold',
    });

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
  const positionLabel = chartType === 'rfi' ? hand?.rfiPosition : hand?.jamPosition;
  const activePosition = positionLabel === 'BTN' ? 'BU' : positionLabel;

  // For the range grid display when SB, combine raise + limp as "in range"
  const displayRange = isSB
    ? [...(data.rfi['SB'] || []), ...getSbLimpRange()]
    : getCurrentRange();

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

        {/* Stack depth - only for Open Jam */}
        {chartType === 'openJam' && (
          <select
            value={jamDepth}
            onChange={(e) => setJamDepth(e.target.value as JamDepth)}
            className="bg-[#16161f] border border-[#2a2a3a] text-white rounded-lg px-3 py-2 text-sm"
          >
            {data.jamDepths.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}

        {/* Position filter */}
        {chartType === 'rfi' ? (
          <select
            value={rfiPosFilter}
            onChange={(e) => setRfiPosFilter(e.target.value as RfiPosition | 'all')}
            className="bg-[#16161f] border border-[#2a2a3a] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Positions</option>
            {data.rfiPositions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        ) : (
          <select
            value={jamPosFilter}
            onChange={(e) => setJamPosFilter(e.target.value as JamPosition | 'all')}
            className="bg-[#16161f] border border-[#2a2a3a] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Positions</option>
            {data.positions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}

        {/* Depth label for RFI */}
        {chartType === 'rfi' && (
          <span className="text-xs text-gray-500 bg-[#16161f] border border-[#2a2a3a] rounded-lg px-3 py-2">
            100BB · 9-handed
          </span>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-sm flex-wrap">
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
          activePosition={activePosition as 'UTG' | 'MP' | 'LJ' | 'HJ' | 'CO' | 'BU' | 'SB' | 'BB'}
          heroCards={hand.cards}
          compact
        />
      )}

      {/* Action info */}
      {hand && !result && (
        <div className="text-center">
          <p className="text-sm text-gray-400">
            You are in <span className="text-pink-500 font-bold">{positionLabel}</span> with{' '}
            <span className="text-white font-bold">{hand.notation}</span>
            {chartType === 'openJam' && (
              <> at <span className="text-white font-bold">{jamDepth}</span></>
            )}
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
            {chartType === 'rfi' ? 'Raise' : 'Jam'}
          </button>
          {isSB && (
            <button
              onClick={() => handleAction('limp')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 text-lg"
            >
              Limp
            </button>
          )}
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
            <span className={`font-bold ${
              lastAnswer.correctAction === 'Fold' ? 'text-red-400' :
              lastAnswer.correctAction === 'Limp' ? 'text-emerald-400' :
              'text-pink-500'
            }`}>
              {lastAnswer.correctAction === 'Fold' ? 'a fold' :
               lastAnswer.correctAction === 'Limp' ? 'a limp' :
               `a ${lastAnswer.correctAction.toLowerCase()}`}
            </span>
            {' '}from <span className="text-pink-500 font-bold">{positionLabel}</span>
            {chartType === 'openJam' && ` at ${jamDepth}`}
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
            {chartType === 'rfi' ? 'RFI' : 'Open Jam'} Range — {positionLabel}
            {chartType === 'openJam' && ` at ${jamDepth}`}
            {chartType === 'rfi' && ' (100BB, 9-handed)'}
          </h3>
          <RangeGrid
            range={displayRange}
            highlightHand={hand.notation}
            sbDetail={isSB ? data.sbDetail : undefined}
          />
          {isSB && (
            <div className="flex gap-4 justify-center text-xs text-gray-400 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-pink-500" />
                <span>Raise (value)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <span>Raise (bluff)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span>Limp</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
