'use client';

import { TabId } from '@/lib/types';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; shortLabel: string }[] = [
  { id: 'trainer', label: 'Preflop Trainer', shortLabel: 'Preflop' },
  { id: 'postflop', label: 'Postflop Drills', shortLabel: 'Postflop' },
  { id: 'ranges', label: 'Range Viewer', shortLabel: 'Ranges' },
  { id: 'bankroll', label: 'Bankroll', shortLabel: 'Bankroll' },
  { id: 'sizing', label: 'Raise Sizing', shortLabel: 'Sizing' },
  { id: 'tips', label: 'Tips', shortLabel: 'Tips' },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-[#2a2a3a]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Logo bar */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-pink-500">A♥</span>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Pink Ace <span className="text-pink-500">GTO</span>
            </h1>
          </div>
          <span className="text-xs text-gray-500 hidden sm:block">GTO Trainer</span>
        </div>

        {/* Tab nav */}
        <nav className="flex gap-1 overflow-x-auto pb-0 -mb-px scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-500'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
