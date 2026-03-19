import React from 'react'

const RANK_LABELS = { 1:'👑', 2:'👸', 3:'🥉', 4:'😓' }
const DIR_LABEL   = { 1:'⬅️ ซ้าย', '-1':'➡️ ขวา' }

export default function PlayerBar({ players, gameState, myId }) {
  const currentRanks = gameState?.currentRanks || []
  const turnId       = gameState?.turn
  const direction    = gameState?.direction || 1

  function getRank(id) {
    const r = currentRanks.find(r => r.id === id)
    return r ? RANK_LABELS[r.pos] : null
  }

  return (
    <div className="player-bar">
      <div className="player-bar__players">
        {players.map(p => {
          const isActive = p.id === turnId
          const rank     = getRank(p.id)
          const isMe     = p.id === myId
          return (
            <div
              key={p.id}
              className={[
                'player-chip',
                isActive ? 'player-chip--active' : '',
                isMe     ? 'player-chip--me'     : '',
              ].join(' ')}
            >
              {rank && <span className="player-chip__rank">{rank}</span>}
              <span className="player-chip__name">{p.name}</span>
              {isMe && <span className="player-chip__you">คุณ</span>}
            </div>
          )
        })}
      </div>

      {gameState && (
        <div className="player-bar__direction">
          {DIR_LABEL[String(direction)]}
        </div>
      )}
    </div>
  )
}