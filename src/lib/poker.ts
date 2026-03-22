import { Card, Rank, Suit } from './types';

const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealHand(): [Card, Card] {
  const deck = shuffleDeck(createDeck());
  return [deck[0], deck[1]];
}

export function rankIndex(rank: Rank): number {
  return RANKS.indexOf(rank);
}

export function handToNotation(card1: Card, card2: Card): string {
  const r1 = rankIndex(card1.rank);
  const r2 = rankIndex(card2.rank);

  const highCard = r1 <= r2 ? card1 : card2;
  const lowCard = r1 <= r2 ? card2 : card1;

  if (highCard.rank === lowCard.rank) {
    return `${highCard.rank}${lowCard.rank}`;
  }

  const suited = highCard.suit === lowCard.suit;
  return `${highCard.rank}${lowCard.rank}${suited ? 's' : 'o'}`;
}

export function isHandInRange(hand: string, range: string[]): boolean {
  return range.includes(hand);
}

export function getSuitColor(suit: Suit): string {
  return suit === '♥' || suit === '♦' ? '#dc2626' : '#1a1a1a';
}

export function getSuitColorLight(suit: Suit): string {
  return suit === '♥' || suit === '♦' ? '#ef4444' : '#e5e7eb';
}

export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

// Build the 13x13 grid labels
export function buildGridLabels(): string[][] {
  const grid: string[][] = [];
  for (let i = 0; i < 13; i++) {
    const row: string[] = [];
    for (let j = 0; j < 13; j++) {
      if (i === j) {
        row.push(`${RANKS[i]}${RANKS[j]}`);
      } else if (i < j) {
        row.push(`${RANKS[i]}${RANKS[j]}s`);
      } else {
        row.push(`${RANKS[j]}${RANKS[i]}o`);
      }
    }
    grid.push(row);
  }
  return grid;
}

export function getRangePercentage(range: string[]): number {
  let combos = 0;
  for (const hand of range) {
    if (hand.length === 2) {
      // Pair: 6 combos
      combos += 6;
    } else if (hand.endsWith('s')) {
      // Suited: 4 combos
      combos += 4;
    } else {
      // Offsuit: 12 combos
      combos += 12;
    }
  }
  return Math.round((combos / 1326) * 100 * 10) / 10;
}

export function getRangeCombos(range: string[]): number {
  let combos = 0;
  for (const hand of range) {
    if (hand.length === 2) {
      combos += 6;
    } else if (hand.endsWith('s')) {
      combos += 4;
    } else {
      combos += 12;
    }
  }
  return combos;
}

export { RANKS, SUITS };
