'use client';

import { Card } from '@/lib/types';

interface PlayingCardProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PlayingCard({ card, size = 'md', className = '' }: PlayingCardProps) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const color = isRed ? 'text-red-600' : 'text-gray-900';

  const sizeClasses = {
    sm: 'w-9 h-[50px] text-sm',
    md: 'w-12 h-[66px] text-lg',
    lg: 'w-[60px] h-[84px] text-xl',
  };

  return (
    <div
      className={`playing-card ${sizeClasses[size]} ${color} ${className}`}
    >
      <span className="leading-none">{card.rank}</span>
      <span className="leading-none -mt-0.5">{card.suit}</span>
    </div>
  );
}
