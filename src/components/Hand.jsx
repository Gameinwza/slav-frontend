import React from 'react'
import Card from './Card'

export default function Hand({ hand, selected, canCardPlay, onToggle, disabled }) {
  return (
    <div className="hand">
      {hand.map((card, i) => {
        const key   = card.value + card.suit
        const isSel = selected.some(c => c.suit === card.suit && c.value === card.value)
        const isPlay = canCardPlay(card)
        return (
          <Card
            key={key}
            card={card}
            selected={isSel}
            playable={isPlay && !isSel}
            disabled={disabled}
            onClick={() => onToggle(card)}
            dealDelay={i * 40}
          />
        )
      })}
    </div>
  )
}