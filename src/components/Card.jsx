import React from 'react'

const RED_SUITS = ['♥', '♦']

const SUIT_SYMBOL = { '♠':'♠', '♥':'♥', '♦':'♦', '♣':'♣' }

export default function Card({ card, selected, playable, disabled, onClick, dealDelay = 0 }) {
  const isRed = RED_SUITS.includes(card.suit)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'card',
        isRed    ? 'card--red'      : 'card--black',
        selected  ? 'card--selected' : '',
        playable  ? 'card--playable' : '',
        disabled  ? 'card--disabled' : '',
      ].join(' ')}
      style={{ animationDelay: `${dealDelay}ms` }}
    >
      {/* top-left */}
      <span className="card__corner card__corner--tl">
        <span className="card__value">{card.value}</span>
        <span className="card__suit">{SUIT_SYMBOL[card.suit]}</span>
      </span>

      {/* center suit */}
      <span className="card__center">{SUIT_SYMBOL[card.suit]}</span>

      {/* bottom-right (rotated) */}
      <span className="card__corner card__corner--br">
        <span className="card__value">{card.value}</span>
        <span className="card__suit">{SUIT_SYMBOL[card.suit]}</span>
      </span>
    </button>
  )
}