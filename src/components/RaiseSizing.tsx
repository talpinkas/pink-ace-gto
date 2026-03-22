'use client';

import { PinkAceData } from '@/lib/types';

interface RaiseSizingProps {
  data: PinkAceData;
}

export default function RaiseSizing({ data }: RaiseSizingProps) {
  return (
    <div className="space-y-4">
      <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#2a2a3a]">
          <h3 className="text-lg font-bold text-white">Open Raise Sizing Guide</h3>
          <p className="text-sm text-gray-400 mt-1">
            Optimal raise sizes based on effective stack depth (from CLC Poker)
          </p>
        </div>

        <div className="divide-y divide-[#2a2a3a]">
          {data.raiseSizing.map((entry, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 hover:bg-[#1c1c28] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <span className="text-pink-500 font-bold text-sm">{entry.size}</span>
                </div>
                <div>
                  <span className="text-white font-medium">{entry.stackRange}</span>
                  <span className="text-gray-500 text-xs block">effective stack</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-pink-500 font-bold text-lg">{entry.size}</span>
                <span className="text-gray-500 text-xs block">open raise</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick reference */}
      <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-white">Quick Notes</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span className="text-pink-500">&#8226;</span>
            <span>Smaller stacks = smaller opens. You need less fold equity with a shorter stack.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-pink-500">&#8226;</span>
            <span>From the SB, many solvers add +0.5x to the standard size due to positional disadvantage.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-pink-500">&#8226;</span>
            <span>At 15BB and below, consider open-jamming with your entire raising range rather than min-raising.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
