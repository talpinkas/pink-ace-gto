'use client';

import { useState, useMemo } from 'react';
import { PinkAceData } from '@/lib/types';

interface TipsProps {
  data: PinkAceData;
}

export default function Tips({ data }: TipsProps) {
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(data.tips.map((t) => t.category)))],
    [data.tips]
  );
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? data.tips : data.tips.filter((t) => t.category === filter);

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === cat
                ? 'bg-pink-500 text-white'
                : 'bg-[#16161f] text-gray-400 hover:text-white border border-[#2a2a3a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tips list */}
      <div className="space-y-3">
        {filtered.map((tip, i) => (
          <div
            key={i}
            className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 flex gap-3 items-start hover:border-pink-500/30 transition-colors"
          >
            <span className="text-2xl flex-shrink-0">{tip.icon}</span>
            <div className="flex-1">
              <span className="text-xs font-medium text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded">
                {tip.category}
              </span>
              <p className="text-sm text-gray-200 mt-1.5 leading-relaxed">{tip.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
