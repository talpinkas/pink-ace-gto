'use client';

import { buildGridLabels } from '@/lib/poker';
import { SbDetail } from '@/lib/types';

interface RangeGridProps {
  range: string[];
  highlightHand?: string;
  compact?: boolean;
  sbDetail?: SbDetail;
}

export default function RangeGrid({ range, highlightHand, compact = false, sbDetail }: RangeGridProps) {
  const grid = buildGridLabels();
  const rangeSet = new Set(range);

  const raiseValueSet = sbDetail ? new Set(sbDetail.raise_value) : null;
  const raiseBluffSet = sbDetail ? new Set(sbDetail.raise_bluff) : null;
  const limpSet = sbDetail ? new Set(sbDetail.limp) : null;

  return (
    <div
      className={`grid ${compact ? 'gap-0' : 'gap-px'} w-full max-w-[420px] mx-auto`}
      style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
    >
      {grid.map((row, i) =>
        row.map((hand, j) => {
          const inRange = rangeSet.has(hand);
          const isHighlight = highlightHand === hand;
          const isPair = i === j;
          const isSuited = i < j;

          let bg = 'bg-[#1a1a2e]';

          if (sbDetail) {
            // SB mode: color by action type
            if (raiseValueSet?.has(hand)) {
              bg = 'bg-pink-600';
            } else if (raiseBluffSet?.has(hand)) {
              bg = 'bg-blue-600';
            } else if (limpSet?.has(hand)) {
              bg = 'bg-emerald-600';
            }
          } else if (inRange) {
            if (isPair) bg = 'bg-emerald-600';
            else if (isSuited) bg = 'bg-emerald-500';
            else bg = 'bg-emerald-700';
          }

          return (
            <div
              key={`${i}-${j}`}
              className={`range-cell aspect-square rounded-[2px] ${bg} ${
                isHighlight
                  ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-[#0a0a0f] z-10 scale-125'
                  : ''
              } ${compact ? 'text-[7px] sm:text-[9px]' : ''}`}
              title={`${hand}${inRange ? ' (in range)' : sbDetail ? '' : ' (fold)'}`}
            >
              {hand}
            </div>
          );
        })
      )}
    </div>
  );
}
