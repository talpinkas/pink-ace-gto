'use client';

import { buildGridLabels } from '@/lib/poker';

interface RangeGridProps {
  range: string[];
  highlightHand?: string;
  compact?: boolean;
}

export default function RangeGrid({ range, highlightHand, compact = false }: RangeGridProps) {
  const grid = buildGridLabels();
  const rangeSet = new Set(range);

  return (
    <div className={`grid grid-cols-13 ${compact ? 'gap-0' : 'gap-px'} w-full max-w-[420px] mx-auto`}>
      {grid.map((row, i) =>
        row.map((hand, j) => {
          const inRange = rangeSet.has(hand);
          const isHighlight = highlightHand === hand;
          const isPair = i === j;
          const isSuited = i < j;

          let bg = 'bg-[#1a1a2e]';
          if (inRange) {
            if (isPair) bg = 'bg-emerald-600';
            else if (isSuited) bg = 'bg-emerald-500';
            else bg = 'bg-emerald-700';
          }

          return (
            <div
              key={`${i}-${j}`}
              className={`range-cell aspect-square rounded-[2px] ${bg} ${
                isHighlight
                  ? 'ring-2 ring-pink-500 ring-offset-1 ring-offset-[#0a0a0f] z-10 scale-125'
                  : ''
              } ${compact ? 'text-[7px] sm:text-[9px]' : ''}`}
              title={`${hand}${inRange ? ' (in range)' : ' (fold)'}`}
            >
              {hand}
            </div>
          );
        })
      )}
    </div>
  );
}
