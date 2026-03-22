export type JamPosition = 'UTG' | 'MP' | 'LJ' | 'HJ' | 'CO' | 'BU' | 'SB';
export type RfiPosition = 'UTG' | 'UTG+1' | 'UTG+2' | 'LJ' | 'HJ' | 'CO' | 'BTN' | 'SB';
export type AllPosition = RfiPosition | JamPosition | 'BB';

export type JamDepth = '6BB' | '9BB' | '12BB' | '15BB';

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface PostflopScenario {
  category: string;
  title: string;
  hero: Card[];
  board: Card[];
  situation: string;
  pot: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface RaiseSizingEntry {
  stackRange: string;
  size: string;
}

export interface Tip {
  category: string;
  text: string;
  icon: string;
}

export interface SbDetail {
  raise_value: string[];
  raise_bluff: string[];
  limp: string[];
}

export interface PinkAceData {
  rfi: Record<RfiPosition, string[]>;
  sbDetail: SbDetail;
  openJam: Record<JamDepth, Record<JamPosition, string[]>>;
  postflopScenarios: PostflopScenario[];
  rfiPositions: RfiPosition[];
  positions: JamPosition[];
  jamDepths: JamDepth[];
  raiseSizing: RaiseSizingEntry[];
  tips: Tip[];
}

export type ChartType = 'rfi' | 'openJam';

export interface TrainerStats {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

export type SessionType = 'MTT' | 'Cash' | 'SNG';
export type EntryType = 'session' | 'deposit' | 'withdrawal';

export interface BankrollEntry {
  id: string;
  date: string;
  type: EntryType;
  gameType?: SessionType;
  buyIn?: number;
  amount: number;
  notes: string;
}

export interface BankrollState {
  entries: BankrollEntry[];
  gameType: SessionType;
  buyIn: number;
}

export type TabId = 'trainer' | 'postflop' | 'ranges' | 'bankroll' | 'sizing' | 'tips';
