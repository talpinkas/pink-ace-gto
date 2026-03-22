'use client';

import { useState, useEffect } from 'react';
import { PinkAceData, TabId } from '@/lib/types';
import Navigation from '@/components/Navigation';
import PreflopTrainer from '@/components/PreflopTrainer';
import PostflopDrills from '@/components/PostflopDrills';
import RangeViewer from '@/components/RangeViewer';
import BankrollManager from '@/components/BankrollManager';
import RaiseSizing from '@/components/RaiseSizing';
import Tips from '@/components/Tips';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('trainer');
  const [data, setData] = useState<PinkAceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const basePath = process.env.NODE_ENV === 'production' ? '/pink-ace-gto' : '';
    fetch(`${basePath}/pinkace-data.json`)
      .then((res) => res.json())
      .then((json: PinkAceData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl font-bold text-pink-500 animate-pulse">A♥</div>
          <p className="text-gray-400">Loading GTO data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <p className="text-red-400">Failed to load training data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <div className="tab-content" key={activeTab}>
          {activeTab === 'trainer' && <PreflopTrainer data={data} />}
          {activeTab === 'postflop' && <PostflopDrills data={data} />}
          {activeTab === 'ranges' && <RangeViewer data={data} />}
          {activeTab === 'bankroll' && <BankrollManager />}
          {activeTab === 'sizing' && <RaiseSizing data={data} />}
          {activeTab === 'tips' && <Tips data={data} />}
        </div>
      </main>

      <footer className="border-t border-[#2a2a3a] py-4 text-center">
        <p className="text-xs text-gray-500">
          Pink Ace GTO Trainer — Ranges from{' '}
          <span className="text-gray-400">CLC Poker</span> solver charts
        </p>
      </footer>
    </div>
  );
}
