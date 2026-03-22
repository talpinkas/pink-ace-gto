'use client';

import { useState } from 'react';
import { BankrollState, BankrollEntry, SessionType, EntryType } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const RECOMMENDED_BIS: Record<SessionType, number> = {
  MTT: 150,
  Cash: 40,
  SNG: 100,
};

export default function BankrollManager() {
  const [state, setState] = useLocalStorage<BankrollState>('pinkace-bankroll', {
    entries: [],
    gameType: 'MTT',
    buyIn: 10,
  });

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<EntryType>('session');
  const [formAmount, setFormAmount] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const totalBankroll = state.entries.reduce((sum, e) => sum + e.amount, 0);
  const recommendedBR = RECOMMENDED_BIS[state.gameType] * state.buyIn;
  const healthPct = recommendedBR > 0 ? Math.min(100, Math.round((totalBankroll / recommendedBR) * 100)) : 0;
  const buyInsRemaining = state.buyIn > 0 ? Math.floor(totalBankroll / state.buyIn) : 0;

  const sessions = state.entries.filter((e) => e.type === 'session');
  const winCount = sessions.filter((e) => e.amount > 0).length;
  const totalSessions = sessions.length;

  const handleSubmit = () => {
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount === 0) return;

    const entry: BankrollEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      type: formType,
      gameType: formType === 'session' ? state.gameType : undefined,
      buyIn: formType === 'session' ? state.buyIn : undefined,
      amount: formType === 'withdrawal' ? -Math.abs(amount) : formType === 'session' ? amount : Math.abs(amount),
      notes: formNotes,
    };

    setState((prev) => ({
      ...prev,
      entries: [entry, ...prev.entries],
    }));

    setFormAmount('');
    setFormNotes('');
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== id),
    }));
  };

  const getHealthColor = () => {
    if (healthPct >= 75) return 'bg-emerald-500';
    if (healthPct >= 50) return 'bg-yellow-500';
    if (healthPct >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-5">
      {/* Config */}
      <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Game Settings</h3>
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Game Type</label>
            <select
              value={state.gameType}
              onChange={(e) =>
                setState((prev) => ({ ...prev, gameType: e.target.value as SessionType }))
              }
              className="bg-[#0a0a0f] border border-[#2a2a3a] text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="MTT">MTT</option>
              <option value="Cash">Cash</option>
              <option value="SNG">SNG</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Buy-in ($)</label>
            <input
              type="number"
              value={state.buyIn}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  buyIn: Math.max(0.01, parseFloat(e.target.value) || 0),
                }))
              }
              className="bg-[#0a0a0f] border border-[#2a2a3a] text-white rounded-lg px-3 py-2 text-sm w-24"
              min="0.01"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Bankroll overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Bankroll</div>
          <div className={`text-xl font-bold ${totalBankroll >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            ${totalBankroll.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Buy-ins Left</div>
          <div className="text-xl font-bold text-white">{buyInsRemaining}</div>
        </div>
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Sessions</div>
          <div className="text-xl font-bold text-white">{totalSessions}</div>
        </div>
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Win Rate</div>
          <div className="text-xl font-bold text-pink-500">
            {totalSessions > 0 ? Math.round((winCount / totalSessions) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Health bar */}
      <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Bankroll Health</span>
          <span className="text-white font-medium">
            {healthPct}% of recommended ({RECOMMENDED_BIS[state.gameType]} BIs)
          </span>
        </div>
        <div className="w-full h-3 bg-[#0a0a0f] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getHealthColor()}`}
            style={{ width: `${healthPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          Target: ${recommendedBR.toFixed(2)} ({RECOMMENDED_BIS[state.gameType]} x ${state.buyIn})
        </p>
      </div>

      {/* Add entry button */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-primary w-full">
          + Log Entry
        </button>
      )}

      {/* Entry form */}
      {showForm && (
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 space-y-3 animate-slide-up">
          <div className="flex gap-2">
            {(['session', 'deposit', 'withdrawal'] as EntryType[]).map((t) => (
              <button
                key={t}
                onClick={() => setFormType(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                  formType === t
                    ? 'bg-pink-500 text-white'
                    : 'bg-[#0a0a0f] text-gray-400 border border-[#2a2a3a]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">
                {formType === 'session' ? 'Profit/Loss ($)' : 'Amount ($)'}
              </label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder={formType === 'session' ? '+50 or -20' : '100'}
                className="bg-[#0a0a0f] border border-[#2a2a3a] text-white rounded-lg px-3 py-2 text-sm w-full"
                step="0.01"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">Notes</label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Optional notes..."
                className="bg-[#0a0a0f] border border-[#2a2a3a] text-white rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="btn-primary flex-1">
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* History */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400">Session History</h3>
        {state.entries.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No entries yet. Log your first session!</p>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {state.entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#16161f] border border-[#2a2a3a] rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${
                      entry.type === 'session'
                        ? 'bg-blue-500/20 text-blue-400'
                        : entry.type === 'deposit'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}
                  >
                    {entry.type}
                  </span>
                  <div>
                    <span
                      className={`font-bold ${
                        entry.amount >= 0 ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {entry.amount >= 0 ? '+' : ''}${entry.amount.toFixed(2)}
                    </span>
                    {entry.notes && (
                      <span className="text-xs text-gray-500 ml-2">{entry.notes}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{entry.date}</span>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-gray-600 hover:text-red-500 text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
