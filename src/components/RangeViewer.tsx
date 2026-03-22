'use client';

import { useState } from 'react';
import { PinkAceData, ChartType, Position, RfiDepth, JamDepth } from '@/lib/types';
import { getRangePercentage, getRangeCombos } from '@/lib/poker';
import RangeGrid from './RangeGrid';

interface RangeViewerProps {
  data: PinkAceData;
}

export default function RangeViewer({ data }: RangeViewerProps) {
  const [chartType, setChartType] = useState<ChartType>('rfi');
  const [rfiDepth, setRfiDepth] = useState<RfiDepth>('25BB');
  const [jamDepth, setJamDepth] = useState<JamDepth>('12BB');
  const [position, setPosition] = useState<Position>('BU');

  const currentDepth = chartType === 'rfi' ? rfiDepth : jamDepth;
  const depths = chartType === 'rfi' ? data.rfiDepths : data.jamDepths;

  const ranges = chartType === 'rfi' ? data.rfi : data.openJam;
  const depthRanges = ranges[currentDepth as keyof typeof ranges];
  const range = depthRanges ? (depthRanges as Record<Position, string[]>)[position] || [] : [];

  const percentage = getRangePercentage(range);
  const combos = getRangeCombos(range);

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
      </div>

      {/* Position selector */}
      <div className="flex gap-2 flex-wrap">
        {data.positions.map((p) => (
          <button
            key={p}
            onClick={() => setPosition(p)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              position === p
                ? 'bg-pink-500 text-white'
                : 'bg-[#16161f] text-gray-400 hover:text-white border border-[#2a2a3a]'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Range info */}
      <div className="flex gap-6 items-center">
        <div>
          <span className="text-gray-400 text-sm">Hands:</span>{' '}
          <span className="text-white font-bold">{range.length}</span>
        </div>
        <div>
          <span className="text-gray-400 text-sm">Combos:</span>{' '}
          <span className="text-white font-bold">{combos}</span>
        </div>
        <div>
          <span className="text-gray-400 text-sm">Range:</span>{' '}
          <span className="text-pink-500 font-bold">{percentage}%</span>
        </div>
      </div>

      {/* Grid */}
      <RangeGrid range={range} />

      {/* Legend */}
      <div className="flex gap-4 justify-center text-xs text-gray-400">
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
      </div>
    </div>
  );
}
