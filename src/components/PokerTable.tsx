'use client';

import { AllPosition, Card } from '@/lib/types';
import PlayingCard from './PlayingCard';

interface PokerTableProps {
  activePosition?: AllPosition;
  heroCards?: Card[];
  communityCards?: Card[];
  compact?: boolean;
}

const SEAT_POSITIONS: { pos: AllPosition; label: string; x: number; y: number }[] = [
  { pos: 'UTG', label: 'UTG', x: 15, y: 75 },
  { pos: 'MP', label: 'MP', x: 10, y: 40 },
  { pos: 'LJ', label: 'LJ', x: 22, y: 10 },
  { pos: 'HJ', label: 'HJ', x: 50, y: 2 },
  { pos: 'CO', label: 'CO', x: 78, y: 10 },
  { pos: 'BU', label: 'BU', x: 90, y: 40 },
  { pos: 'SB', label: 'SB', x: 85, y: 75 },
  { pos: 'BB', label: 'BB', x: 50, y: 85 },
];

export default function PokerTable({
  activePosition,
  heroCards,
  communityCards,
  compact = false,
}: PokerTableProps) {
  const tableHeight = compact ? 'h-48 sm:h-56' : 'h-56 sm:h-72';

  return (
    <div className={`relative w-full max-w-lg mx-auto ${tableHeight}`}>
      {/* Felt surface */}
      <div className="poker-felt absolute inset-4 sm:inset-6 rounded-[50%]">
        {/* Community cards */}
        {communityCards && communityCards.length > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
            {communityCards.map((card, i) => (
              <PlayingCard key={i} card={card} size="sm" />
            ))}
          </div>
        )}
      </div>

      {/* Seats */}
      {SEAT_POSITIONS.map(({ pos, label, x, y }) => {
        const isActive = activePosition === pos;
        const isBB = pos === 'BB';

        return (
          <div
            key={pos}
            className="absolute flex flex-col items-center gap-0.5"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-pink-500 text-white seat-active'
                  : isBB
                  ? 'bg-gray-700/50 text-gray-500 border border-gray-600'
                  : 'bg-[#1a1a2e] text-gray-300 border border-[#2a2a3a]'
              }`}
            >
              {label}
            </div>

            {/* Hero cards next to active seat */}
            {isActive && heroCards && heroCards.length === 2 && (
              <div className="flex gap-0.5 mt-0.5">
                <PlayingCard card={heroCards[0]} size="sm" />
                <PlayingCard card={heroCards[1]} size="sm" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
