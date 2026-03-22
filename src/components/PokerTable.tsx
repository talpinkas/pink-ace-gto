'use client';

import { Card } from '@/lib/types';
import PlayingCard from './PlayingCard';

interface PokerTableProps {
  activePosition?: string;
  heroCards?: Card[];
  communityCards?: Card[];
  compact?: boolean;
}

const SEAT_POSITIONS: { pos: string; aliases: string[]; label: string; x: number; y: number }[] = [
  { pos: 'UTG', aliases: ['UTG'], label: 'UTG', x: 12, y: 72 },
  { pos: 'UTG+1', aliases: ['UTG+1', 'MP'], label: 'UTG+1', x: 8, y: 45 },
  { pos: 'UTG+2', aliases: ['UTG+2'], label: 'UTG+2', x: 15, y: 18 },
  { pos: 'LJ', aliases: ['LJ'], label: 'LJ', x: 35, y: 5 },
  { pos: 'HJ', aliases: ['HJ'], label: 'HJ', x: 57, y: 5 },
  { pos: 'CO', aliases: ['CO'], label: 'CO', x: 78, y: 18 },
  { pos: 'BU', aliases: ['BU', 'BTN'], label: 'BTN', x: 90, y: 45 },
  { pos: 'SB', aliases: ['SB'], label: 'SB', x: 82, y: 72 },
  { pos: 'BB', aliases: ['BB'], label: 'BB', x: 50, y: 88 },
];

export default function PokerTable({
  activePosition,
  heroCards,
  communityCards,
  compact = false,
}: PokerTableProps) {
  const tableHeight = compact ? 'h-52 sm:h-64' : 'h-56 sm:h-72';

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
      {SEAT_POSITIONS.map(({ pos, aliases, label, x, y }) => {
        const isActive = activePosition ? aliases.includes(activePosition) || pos === activePosition : false;
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
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300 ${
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
