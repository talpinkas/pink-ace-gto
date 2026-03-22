'use client';

import { useState } from 'react';
import { PinkAceData, ChartType, RfiPosition, JamPosition, JamDepth } from '@/lib/types';
import { getRangePercentage, getRangeCombos } from '@/lib/poker';
import RangeGrid from './RangeGrid';

interface RangeViewerProps {
  data: PinkAceData;
}

export default function RangeViewer({ data }: RangeViewerProps) {
  const [chartType, setChartType] = useState<ChartType>('rfi');
  const [rfiPosition, setRfiPosition] = useState<RfiPosition>('BTN');
  const [jamPosition, setJamPosition] = useState<JamPosition>('BU');
  const [jamDepth, setJamDepth] = useState<JamDepth>('12BB');

  const isSB = chartType === 'rfi' && rfiPosition === 'SB';

  let range: string[] = [];
  if (chartType === 'rfi') {
    if (isSB) {
      // Combine all SB actions for the range display
      range = [
        ...(data.rfi['SB'] || []),
        ...(data.sbDetail?.limp || []),
      ];
    } else {
      range = data.rfi[rfiPosition] || [];
    }
  } else {
    const depthRanges = data.openJam[jamDepth];
    range = depthRanges ? depthRanges[jamPosition] || [] : [];
  }

  const percentage = getRangePercentage(range);
  const combos = getRangeCombos(range);

  // SB detail stats
  const sbRaiseRange = isSB ? (data.rfi['SB'] || []) : [];
  const sbLimpRange = isSB ? (data.sbDetail?.limp || []) : [];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
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

        {chartType === 'rfi' && (
          <span className="text-xs text-gray-500 bg-[#16161f] border border-[#2a2a3a] rounded-lg px-3 py-2">
            100BB · 9-handed
          </span>
        )}
      </div>

      {/* Position selector */}
      <div className="flex gap-2 flex-wrap">
        {chartType === 'rfi'
          ? data.rfiPositions.map((p) => (
              <button
                key={p}
                onClick={() => setRfiPosition(p)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  rfiPosition === p
                    ? 'bg-pink-500 text-white'
                    : 'bg-[#16161f] text-gray-400 hover:text-white border border-[#2a2a3a]'
                }`}
              >
                {p}
              </button>
            ))
          : data.positions.map((p) => (
              <button
                key={p}
                onClick={() => setJamPosition(p)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  jamPosition === p
                    ? 'bg-pink-500 text-white'
                    : 'bg-[#16161f] text-gray-400 hover:text-white border border-[#2a2a3a]'
                }`}
              >
                {p}
              </button>
            ))}
      </div>

      {/* Range info */}
      <div className="flex gap-6 items-center flex-wrap">
        {isSB ? (
          <>
            <div>
              <span className="text-gray-400 text-sm">Raise:</span>{' '}
              <span className="text-pink-500 font-bold">{sbRaiseRange.length} hands</span>
              <span className="text-gray-500 text-xs ml-1">({getRangePercentage(sbRaiseRange)}%)</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Limp:</span>{' '}
              <span className="text-emerald-500 font-bold">{sbLimpRange.length} hands</span>
              <span className="text-gray-500 text-xs ml-1">({getRangePercentage(sbLimpRange)}%)</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Total played:</span>{' '}
              <span className="text-white font-bold">{percentage}%</span>
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="text-gray-400 text-sm">Hands:</span>{' '}
              <span className="text-white font-bold">{chartType === 'rfi' ? (data.rfi[rfiPosition] || []).length : range.length}</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Combos:</span>{' '}
              <span className="text-white font-bold">{combos}</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Range:</span>{' '}
              <span className="text-pink-500 font-bold">{percentage}%</span>
            </div>
          </>
        )}
      </div>

      {/* Grid */}
      <RangeGrid
        range={range}
        sbDetail={isSB ? data.sbDetail : undefined}
      />

      {/* Legend */}
      <div className="flex gap-4 justify-center text-xs text-gray-400 flex-wrap">
        {isSB ? (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-pink-600" />
              <span>Raise (value)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-600" />
              <span>Raise (bluff)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-600" />
              <span>Limp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#1a1a2e]" />
              <span>Fold</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-600" />
              <span>Pairs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span>Suited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-700" />
              <span>Offsuit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#1a1a2e]" />
              <span>Fold</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
